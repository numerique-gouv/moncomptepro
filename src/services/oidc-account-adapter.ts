import { isEmpty } from 'lodash';
import { findById as findUserById } from '../repositories/user';
import { isCollectiviteTerritoriale, isServicePublic } from './organization';
import { findByUserId as getUsersOrganizations } from '../repositories/organization/getters';
import { getSelectedOrganizationId } from '../repositories/redis/selected-organization';
import { mustReturnOneOrganizationInPayload } from './must-return-one-organization-in-payload';

export const findAccount = async (ctx: any, sub: string, token: any) => {
  const user = await findUserById(parseInt(sub, 10));

  if (isEmpty(user)) {
    return null;
  }

  return {
    accountId: sub,
    async claims(use: any, scope: string, claims: any, rejected: any) {
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

      const personalClaims = {
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
      };
      const organizations = await getUsersOrganizations(id);
      if (mustReturnOneOrganizationInPayload(scope)) {
        const selectedOrganizationId = await getSelectedOrganizationId(id);

        if (selectedOrganizationId === null) {
          throw Error('selectedOrganization should be set');
        }

        const organization = organizations.find(
          ({ id }) => id === selectedOrganizationId
        );

        if (isEmpty(organization)) {
          throw Error('organization should be set');
        }

        return {
          ...personalClaims,
          label: organization.cached_libelle,
          siret: organization.siret,
          is_collectivite_territoriale: isCollectiviteTerritoriale(
            organization,
            true
          ),
          is_external: organization.is_external,
          is_service_public: isServicePublic(organization),
        };
      } else {
        return {
          ...personalClaims,
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
      }
    },
  };
};
