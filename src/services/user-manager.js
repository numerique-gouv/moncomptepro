import { isEmpty } from 'lodash';

import { findByEmail, findByToken, insert, update } from './users';
import {
  generateToken,
  hashPassword,
  isPasswordSecure,
  validatePassword,
} from './security';
import { sendMail } from '../connectors/mailer';

const EXPIRATION_DURATION_IN_MINUTES = 15;

const isExpired = emittedDate => {
  if (!(emittedDate instanceof Date)) {
    return true;
  }

  const nowDate = new Date();

  return nowDate - emittedDate > EXPIRATION_DURATION_IN_MINUTES * 60e3;
};

export const login = async (login, password) => {
  const user = await findByEmail(login);

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

export const signup = async (login, password) => {
  const user = await findByEmail(login);

  if (!isEmpty(user)) {
    throw new Error('username_unavailable');
  }

  if (!isPasswordSecure(password)) {
    throw new Error('weak_password');
  }

  const hashedPassword = await hashPassword(password);

  return await insert({
    email: login,
    encrypted_password: hashedPassword,
    reset_password_token: null,
    reset_password_sent_at: null,
    sign_in_count: 0,
    last_sign_in_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    roles: [],
    legacy_account_type: 'service_provider',
  });
};

export const sendResetPasswordEmail = async login => {
  const user = await findByEmail(login);

  if (isEmpty(user)) {
    // failing silently as we do not want to give info on whether the user exists or not
    return true;
  }

  const resetPasswordToken = await generateToken();

  await update(user.id, {
    reset_password_token: resetPasswordToken,
    reset_password_sent_at: new Date().toISOString(),
  });

  // do not await for mail to be sent as it can take a while
  sendMail({
    to: login,
    template: 'reset-password',
    params: { resetPasswordToken },
  });

  return true;
};

export const changePassword = async (token, password) => {
  // check that token as not the default empty value as it will match all users
  if (!token || token === '') {
    throw new Error('invalid_token');
  }

  const user = await findByToken(token);

  if (isEmpty(user)) {
    throw new Error('invalid_token');
  }

  const isTokenExpired = isExpired(user.reset_password_sent_at);

  if (isTokenExpired) {
    throw new Error('invalid_token');
  }

  if (!isPasswordSecure(password)) {
    throw new Error('weak_password');
  }

  const hashedPassword = await hashPassword(password);

  return await update(user.id, {
    encrypted_password: hashedPassword,
    updated_at: new Date().toISOString(),
    reset_password_token: null,
    reset_password_sent_at: null,
  });
};
