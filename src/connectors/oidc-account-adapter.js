import { isEmpty } from 'lodash';
import { findById as findUserById } from '../services/users';
import { findByUserId as getUsersOrganizations } from '../services/organizations';

export const findById = async (ctx, sub, token) => {
  const user = await findUserById(sub);

  if (isEmpty(user)) {
    return null;
  }

  const organizations = await getUsersOrganizations(sub);

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
        given_name,
        family_name,
        roles,
      } = user;

      return {
        sub: id, // it is essential to always return a sub claim
        email,
        email_verified,
        updated_at,
        given_name,
        family_name,
        roles,
        organizations,
      };
    },
  };
};
