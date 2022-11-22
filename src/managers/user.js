import { isEmpty } from 'lodash';
import { isEmailSafeToSendTransactional } from '../connectors/debounce';
import { sendMail } from '../connectors/sendinblue';

import {
  create,
  findByEmail,
  findByMagicLinkToken,
  findByResetPasswordToken,
  update,
} from '../repositories/user';
import { isExpired } from '../services/is-expired';
import {
  generatePinToken,
  generateToken,
  hashPassword,
  isPasswordSecure,
  validatePassword,
} from '../services/security';

const RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES = 60;
const VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES = 60;
const MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES = 10;
const MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES =
  3 * 30 * 24 * 60;

export const startLogin = async email => {
  const userExists = !isEmpty(await findByEmail(email));

  if (!userExists && !(await isEmailSafeToSendTransactional(email))) {
    throw new Error('invalid_email');
  }

  return { email, userExists };
};

export const login = async (email, password) => {
  const user = await findByEmail(email);
  if (isEmpty(user)) {
    // this is not a proper error name but this case should never happen
    // we throw a clean error as a mesure of defensive programming
    throw new Error('invalid_credentials');
  }

  const isMatch = await validatePassword(password, user.encrypted_password);

  if (!isMatch) {
    throw new Error('invalid_credentials');
  }

  return await update(user.id, {
    sign_in_count: user.sign_in_count + 1,
    last_sign_in_at: new Date().toISOString(),
  });
};

export const signup = async (email, password) => {
  const user = await findByEmail(email);

  if (!isEmpty(user)) {
    throw new Error('email_unavailable');
  }

  if (!isPasswordSecure(password)) {
    throw new Error('weak_password');
  }

  const hashedPassword = await hashPassword(password);

  return await create({
    email,
    encrypted_password: hashedPassword,
  });
};

export const sendEmailAddressVerificationEmail = async ({
  email,
  checkBeforeSend,
}) => {
  const user = await findByEmail(email);

  if (user.email_verified) {
    throw new Error('email_verified_already');
  }

  if (
    checkBeforeSend &&
    !isExpired(
      user.verify_email_sent_at,
      VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES
    )
  ) {
    return false;
  }

  const verify_email_token = await generatePinToken();

  await update(user.id, {
    verify_email_token,
    verify_email_sent_at: new Date().toISOString(),
  });

  await sendMail({
    to: [user.email],
    subject: `Code de confirmation MonComptePro : ${verify_email_token}`,
    template: 'verify-email',
    params: {
      verify_email_token,
    },
  });

  return true;
};

export const verifyEmail = async (email, token) => {
  const user = await findByEmail(email);

  if (user.verify_email_token !== token) {
    throw new Error('invalid_token');
  }

  const isTokenExpired = isExpired(
    user.verify_email_sent_at,
    VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES
  );

  if (isTokenExpired) {
    throw new Error('invalid_token');
  }

  return await update(user.id, {
    email_verified: true,
    email_verified_at: new Date().toISOString(),
    verify_email_token: null,
    verify_email_sent_at: null,
  });
};

export const updateEmailAddressVerificationStatus = async email => {
  const user = await findByEmail(email);

  if (
    user.email_verified &&
    isExpired(
      user.email_verified_at,
      MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES
    )
  ) {
    const updatedUser = await update(user.id, {
      email_verified: false,
    });

    return { user: updatedUser, needs_email_verification_renewal: true };
  }

  return { user, needs_email_verification_renewal: false };
};

export const sendSendMagicLinkEmail = async (email, host) => {
  let user = await findByEmail(email);

  if (isEmpty(user)) {
    user = await create({
      email,
    });
  }

  const magicLinkToken = await generateToken();

  await update(user.id, {
    magic_link_token: magicLinkToken,
    magic_link_sent_at: new Date().toISOString(),
  });

  await sendMail({
    to: [user.email],
    subject: 'Connexion avec un lien magique',
    template: 'magic-link',
    params: {
      magic_link: `${host}/users/sign-in-with-magic-link?magic_link_token=${magicLinkToken}`,
    },
  });

  return true;
};

export const loginWithMagicLink = async token => {
  // check that token as not the default empty value as it will match all users
  if (!token) {
    throw new Error('invalid_magic_link');
  }

  const user = await findByMagicLinkToken(token);

  if (isEmpty(user)) {
    throw new Error('invalid_magic_link');
  }

  const isTokenExpired = isExpired(
    user.magic_link_sent_at,
    MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES
  );

  if (isTokenExpired) {
    throw new Error('invalid_magic_link');
  }

  return await update(user.id, {
    email_verified: true,
    email_verified_at: new Date().toISOString(),
    magic_link_token: null,
    magic_link_sent_at: null,
  });
};

export const sendResetPasswordEmail = async (email, host) => {
  const user = await findByEmail(email);

  if (isEmpty(user)) {
    // failing silently as we do not want to give info on whether the user exists or not
    return true;
  }

  const resetPasswordToken = await generateToken();

  await update(user.id, {
    reset_password_token: resetPasswordToken,
    reset_password_sent_at: new Date().toISOString(),
  });

  await sendMail({
    to: [user.email],
    subject: 'Instructions pour la réinitialisation du mot de passe',
    template: 'reset-password',
    params: {
      reset_password_link: `${host}/users/change-password?reset_password_token=${resetPasswordToken}`,
    },
  });

  return true;
};

export const changePassword = async (token, password) => {
  // check that token as not the default empty value as it will match all users
  if (!token) {
    throw new Error('invalid_token');
  }

  const user = await findByResetPasswordToken(token);

  if (isEmpty(user)) {
    throw new Error('invalid_token');
  }

  const isTokenExpired = isExpired(
    user.reset_password_sent_at,
    RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES
  );

  if (isTokenExpired) {
    throw new Error('invalid_token');
  }

  if (!isPasswordSecure(password)) {
    throw new Error('weak_password');
  }

  const hashedPassword = await hashPassword(password);

  return await update(user.id, {
    encrypted_password: hashedPassword,
    reset_password_token: null,
    reset_password_sent_at: null,
  });
};

export const updatePersonalInformations = async (
  userId,
  { given_name, family_name, phone_number, job }
) => {
  return await update(userId, {
    given_name,
    family_name,
    phone_number,
    job,
  });
};
