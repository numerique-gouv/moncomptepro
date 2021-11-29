import { isEmpty, isString } from 'lodash';

import {
  findByEmail,
  findByResetPasswordToken,
  findByVerifyEmailToken,
  create,
  update,
} from '../repositories/user';
import {
  generatePinToken,
  generateToken,
  hashPassword,
  isEmailValid,
  isPasswordSecure,
  isPhoneNumberValid,
  validatePassword,
} from '../services/security';
import { sendMail } from '../connectors/sendinblue';

const { API_AUTH_HOST } = process.env;

const RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES = 60;
const VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES = 60;

const isExpired = (emittedDate, expirationDurationInMinutes) => {
  if (!(emittedDate instanceof Date)) {
    return true;
  }

  const nowDate = new Date();

  return nowDate - emittedDate > expirationDurationInMinutes * 60e3;
};

export const login = async (email, password) => {
  if (!isEmailValid(email)) {
    throw new Error('invalid_email');
  }

  const sanitizedEmail = email.toLowerCase().trim();
  const user = await findByEmail(sanitizedEmail);

  if (isEmpty(user)) {
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
  if (!isEmailValid(email)) {
    throw new Error('invalid_email');
  }

  const sanitizedEmail = email.toLowerCase().trim();
  const user = await findByEmail(sanitizedEmail);

  if (!isEmpty(user)) {
    throw new Error('email_unavailable');
  }

  if (!isPasswordSecure(password)) {
    throw new Error('weak_password');
  }

  const hashedPassword = await hashPassword(password);

  return await create({
    email: sanitizedEmail,
    email_verified: false,
    verify_email_token: null,
    verify_email_sent_at: null,
    encrypted_password: hashedPassword,
    reset_password_token: null,
    reset_password_sent_at: null,
    sign_in_count: 0,
    last_sign_in_at: null,
  });
};

export const sendEmailAddressVerificationEmail = async email => {
  if (!isEmailValid(email)) {
    throw new Error('invalid_email');
  }

  const sanitizedEmail = email.toLowerCase().trim();
  const user = await findByEmail(sanitizedEmail);

  if (user.email_verified) {
    throw new Error('email_verified_already');
  }

  const verify_email_token = await generatePinToken();

  await update(user.id, {
    verify_email_token,
    verify_email_sent_at: new Date().toISOString(),
  });

  await sendMail({
    to: [user.email],
    subject: `Code de confirmation api.gouv.fr : ${verify_email_token}`,
    template: 'verify-email',
    params: {
      verify_email_token,
    },
  });

  return true;
};

export const verifyEmail = async token => {
  if (!token || token === '') {
    throw new Error('invalid_token');
  }

  const user = await findByVerifyEmailToken(token);

  if (isEmpty(user)) {
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
    verify_email_token: null,
    verify_email_sent_at: null,
  });
};

export const sendResetPasswordEmail = async email => {
  if (!isEmailValid(email)) {
    throw new Error('invalid_email');
  }

  const sanitizedEmail = email.toLowerCase().trim();
  const user = await findByEmail(sanitizedEmail);

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
      reset_password_link: `${API_AUTH_HOST}/users/change-password?reset_password_token=${resetPasswordToken}`,
    },
  });

  return true;
};

export const changePassword = async (token, password) => {
  // check that token as not the default empty value as it will match all users
  if (!token || token === '') {
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
  if (!isString(given_name) || !isString(family_name) || !isString(job)) {
    throw new Error('invalid_personal_informations');
  }
  if (!isPhoneNumberValid(phone_number)) {
    throw new Error('invalid_personal_informations');
  }

  return await update(userId, {
    given_name,
    family_name,
    phone_number,
    job,
  });
};
