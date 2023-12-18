import {
  createAuthenticator,
  getByUserId,
} from '../repositories/authenticator';
import {
  NotFoundError,
  WebauthnRegistrationFailedError,
} from '../config/errors';
import {
  generateRegistrationOptions,
  VerifiedRegistrationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { findById as findUserById, update } from '../repositories/user';
import { isEmpty } from 'lodash';
import { MONCOMPTEPRO_HOST } from '../config/env';
import { RegistrationResponseJSON } from '@simplewebauthn/server/esm/deps';

// Human-readable title for your website
const rpName = 'MonComptePro';
// A unique identifier for your website
const rpID = new URL(MONCOMPTEPRO_HOST).host;
// The URL at which registrations and authentications should occur
const origin = MONCOMPTEPRO_HOST;

export const getRegistrationOptions = async (user_id: number) => {
  const user = await findUserById(user_id);

  if (isEmpty(user)) {
    throw new NotFoundError();
  }

  // Retrieve any of the user's previously-registered authenticators
  const userAuthenticators = await getByUserId(user.id);

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
      transports: authenticator.transports,
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
  user_id,
  response,
}: {
  user_id: number;
  response: RegistrationResponseJSON;
}) => {
  const user = await findUserById(user_id);

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

  return verification;
};
