import { isEmpty } from 'lodash';
import { findByUserId as getUsersOrganizations } from '../repositories/organization';
import { findById as findUserById } from '../repositories/user';

export const findAccount = async (ctx: any, sub: string, token: any) => {
  const user = await findUserById(parseInt(sub, 10));

  if (isEmpty(user)) {
    return null;
  }

  const organizations = await getUsersOrganizations(parseInt(sub, 10));

  return {
    accountId: sub,
    async claims(use: any, scope: any, claims: any, rejected: any) {
      const {
        id,
        email,
        email_verified,
        updated_at,
        given_name,
        family_name,
        phone_number,
        job,
      } = user;

      return {
        sub: id.toString(), // it is essential to always return a sub claim
        email,
        email_verified,
        updated_at,
        given_name,
        family_name,
        phone_number,
        job,
        organizations: organizations.map(
          ({ id, siret, is_external, cached_libelle: label }) => ({
            id,
            siret,
            is_external,
            label,
          })
        ),
      };
    },
  };
};