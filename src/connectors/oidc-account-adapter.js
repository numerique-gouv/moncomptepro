import { isEmpty } from 'lodash';
import { findById as findUserById } from '../services/users';

export const findById = async (ctx, sub, token) => {
  const user = await findUserById(sub);

  if (isEmpty(user)) {
    return null;
  }

  return {
    accountId: sub,
    async claims(use, scope, claims, rejected) {
      const {
        id,
        email,
        email_verified,
        verify_email_token,
        verify_email_sent_at,
        encrypted_password,
        reset_password_token,
        reset_password_sent_at,
        sign_in_count,
        last_sign_in_at,
        created_at,
        updated_at,
        roles,
        legacy_account_type,
      } = user;

      return {
        sub: id, // it is essential to always return a sub claim

        address: {
          country: null,
          formatted: null,
          locality: null,
          postal_code: null,
          region: null,
          street_address: null,
        },
        birthdate: null,
        email,
        email_verified,
        family_name: null,
        gender: null,
        given_name: null,
        locale: null,
        middle_name: null,
        name: null,
        nickname: null,
        phone_number: null,
        phone_number_verified: false,
        picture: null,
        preferred_username: null,
        profile: null,
        updated_at,
        website: null,
        zoneinfo: null,
        roles,
        legacy_account_type,
      };
    },
  };
};
