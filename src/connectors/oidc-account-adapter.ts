import { isEmpty } from 'lodash';
import { findById as findUserById } from '../repositories/user';
import {
  isCollectiviteTerritoriale,
  isServicePublic,
} from '../services/organization';
import { findByUserId as getUsersOrganizations } from '../repositories/organization/getters';

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
        uid: id.toString(), // for AgentConnect use only
        email,
        email_verified,
        updated_at,
        given_name,
        family_name,
        usual_name: family_name, // for AgentConnect use only
        phone_number,
        phone_number_verified: false,
        job,
        organizations: organizations.map(organization => {
          const {
            id,
            siret,
            is_external,
            cached_libelle: label,
          } = organization;

          return {
            id,
            siret,
            is_external,
            label,
            is_collectivite_territoriale: isCollectiviteTerritoriale(
              organization,
              true
            ),
            is_service_public: isServicePublic(organization),
          };
        }),
      };
    },
  };
};
