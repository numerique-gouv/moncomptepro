import { intersection, isEmpty } from "lodash-es";

export const organizationClaims = [
  "label",
  "siret",
  "is_commune",
  "is_external",
  "is_public_service",
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
