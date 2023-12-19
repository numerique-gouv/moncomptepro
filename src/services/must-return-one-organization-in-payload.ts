import { intersection, isEmpty } from "lodash";

export const organizationClaims = [
  "label",
  "siret",
  "is_collectivite_territoriale", // deprecated
  "is_commune",
  "is_external",
  "is_service_public",
];

const organizationScope = "organization";

export const mustReturnOneOrganizationInPayload = (scopes: string) => {
  const scopesArray = scopes.split(" ");

  const commonScopes = intersection(scopesArray, [
    ...organizationClaims,
    organizationScope,
  ]);

  return !isEmpty(commonScopes);
};
