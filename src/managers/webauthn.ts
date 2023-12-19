import {
  createAuthenticator,
  find as findAuthenticator,
  getByUserId as getAuthenticatorsByUserId,
  saveAuthenticatorCounter,
} from '../repositories/authenticator';
import {
  NotFoundError,
  WebauthnAuthenticationFailedError,
  WebauthnRegistrationFailedError,
} from '../config/errors';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { findByEmail as findUserByEmail, update } from '../repositories/user';
import { isEmpty } from 'lodash';
import { MONCOMPTEPRO_HOST } from '../config/env';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server/esm/deps';
import { decodeBase64URL, encodeBase64URL } from '../services/base64';

// Human-readable title for your website
const rpName = 'MonComptePro';
// A unique identifier for your website
const rpID = new URL(MONCOMPTEPRO_HOST).host;
// The URL at which registrations and authentications should occur
const origin = MONCOMPTEPRO_HOST;

export const getUserAuthenticators = async (email: string) => {
  const user = await findUserByEmail(email);

  if (isEmpty(user)) {
    throw new NotFoundError();
  }

  const userAuthenticators = await getAuthenticatorsByUserId(user.id);

  return userAuthenticators.map(({ credential_id, counter }) => ({
    credential_id: encodeBase64URL(credential_id),
    counter,
  }));
};

export const getRegistrationOptions = async (email: string) => {
  const user = await findUserByEmail(email);

  if (isEmpty(user)) {
    throw new NotFoundError();
  }

  // Retrieve any of the user's previously-registered authenticators
  const userAuthenticators = await getAuthenticatorsByUserId(user.id);

  const registrationOptions = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id.toString(10),
    userName: user.email,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: 'none',
    // Prevent users from re-registering existing authenticators
    excludeCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credential_id,
      type: 'public-key',
      // Optional
      transports: authenticator.transports || [],
    })),
    // See "Guiding use of authenticators via authenticatorSelection" below
    authenticatorSelection: {
      // Defaults
      residentKey: 'preferred',
      userVerification: 'preferred',
      // Optional
      authenticatorAttachment: 'platform',
    },
  });

  // Remember the challenge for this user
  const updatedUser = await update(user.id, {
    current_challenge: registrationOptions.challenge,
  });

  return { updatedUser, registrationOptions };
};

export const verifyRegistration = async ({
  email,
  response,
}: {
  email: string;
  response: RegistrationResponseJSON;
}) => {
  const user = await findUserByEmail(email);

  if (isEmpty(user) || !user.current_challenge) {
    throw new NotFoundError();
  }

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: user.current_challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error) {
    console.error(error);
    throw new WebauthnRegistrationFailedError();
  }

  const { verified, registrationInfo } = verification;

  if (!verified || isEmpty(registrationInfo)) {
    throw new WebauthnRegistrationFailedError();
  }

  const {
    credentialPublicKey: credential_public_key,
    credentialID: credential_id,
    counter,
    credentialDeviceType: credential_device_type,
    credentialBackedUp: credential_backed_up,
  } = registrationInfo;

  // Save the authenticator info so that we can get it by user ID later
  await createAuthenticator({
    user_id: user.id,
    authenticator: {
      credential_id,
      credential_public_key,
      counter,
      credential_device_type,
      credential_backed_up,
    },
  });

  return { verified };
};

export const getAuthenticationOptions = async (email: string | undefined) => {
  if (!email) {
    throw new NotFoundError();
  }

  const user = await findUserByEmail(email);

  if (isEmpty(user)) {
    throw new NotFoundError();
  }

  // Retrieve any of the user's previously-registered authenticators
  const userAuthenticators = await getAuthenticatorsByUserId(user.id);

  const authenticationOptions = await generateAuthenticationOptions({
    rpID,
    // Require users to use a previously-registered authenticator
    allowCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credential_id,
      type: 'public-key',
      transports: authenticator.transports || [],
    })),
    userVerification: 'preferred',
  });

  // Remember the challenge for this user
  const updatedUser = await update(user.id, {
    current_challenge: authenticationOptions.challenge,
  });

  return { updatedUser, authenticationOptions };
};

export const verifyAuthentication = async ({
  email,
  response,
}: {
  email: string | undefined;
  response: AuthenticationResponseJSON;
}) => {
  if (!email) {
    throw new NotFoundError();
  }

  const user = await findUserByEmail(email);

  if (isEmpty(user) || !user.current_challenge) {
    throw new NotFoundError();
  }

  // Retrieve an authenticator from the DB that should match the `id` in the returned credential
  const authenticator = await findAuthenticator(
    user.id,
    decodeBase64URL(response.id)
  );

  if (isEmpty(authenticator)) {
    throw new NotFoundError();
  }

  const {
    credential_public_key: credentialPublicKey,
    credential_id: credentialID,
    counter,
    transports,
  } = authenticator;

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.current_challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey,
        credentialID,
        counter,
        transports,
      },
    });
  } catch (error) {
    console.error(error);
    throw new WebauthnAuthenticationFailedError();
  }

  const { verified, authenticationInfo } = verification;

  if (!verified || isEmpty(authenticationInfo)) {
    throw new WebauthnAuthenticationFailedError();
  }

  await saveAuthenticatorCounter(
    authenticationInfo.credentialID,
    authenticationInfo.newCounter
  );

  return { verified, user };
};
