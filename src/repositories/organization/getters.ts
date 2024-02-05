import { getDatabaseConnection } from "../../connectors/postgres";
import { QueryResult } from "pg";
import { MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES } from "../../config/env";

export const findById = async (id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization> = await connection.query(
    `
SELECT
    id,
    siret,
    verified_email_domains,
    authorized_email_domains,
    external_authorized_email_domains,
    created_at,
    updated_at,
    cached_libelle,
    cached_nom_complet,
    cached_enseigne,
    cached_tranche_effectifs,
    cached_tranche_effectifs_unite_legale,
    cached_libelle_tranche_effectif,
    cached_etat_administratif,
    cached_est_active,
    cached_statut_diffusion,
    cached_est_diffusible,
    cached_adresse,
    cached_code_postal,
    cached_code_officiel_geographique,
    cached_activite_principale,
    cached_libelle_activite_principale,
    cached_categorie_juridique,
    cached_libelle_categorie_juridique,
    organization_info_fetched_at
FROM organizations
WHERE id = $1`,
    [id],
  );

  return rows.shift();
};
export const findByUserId = async (user_id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization & BaseUserOrganizationLink> =
    await connection.query(
      `
SELECT
    o.id,
    o.siret,
    o.verified_email_domains,
    o.authorized_email_domains,
    o.external_authorized_email_domains,
    o.created_at,
    o.updated_at,
    o.cached_libelle,
    o.cached_nom_complet,
    o.cached_enseigne,
    o.cached_tranche_effectifs,
    o.cached_tranche_effectifs_unite_legale,
    o.cached_libelle_tranche_effectif,
    o.cached_etat_administratif,
    o.cached_est_active,
    o.cached_statut_diffusion,
    o.cached_est_diffusible,
    o.cached_adresse,
    o.cached_code_postal,
    o.cached_code_officiel_geographique,
    o.cached_activite_principale,
    o.cached_libelle_activite_principale,
    o.cached_categorie_juridique,
    o.cached_libelle_categorie_juridique,
    o.organization_info_fetched_at,
    uo.is_external,
    uo.verification_type,
    uo.authentication_by_peers_type,
    uo.has_been_greeted,
    uo.sponsor_id,
    uo.needs_official_contact_email_verification,
    uo.official_contact_email_verification_token,
    uo.official_contact_email_verification_sent_at
FROM organizations o
INNER JOIN users_organizations uo ON uo.organization_id = o.id
WHERE uo.user_id = $1
ORDER BY uo.created_at`,
      [user_id],
    );

  return rows;
};
export const findPendingByUserId = async (user_id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization> = await connection.query(
    `
SELECT
    o.id,
    o.siret,
    o.verified_email_domains,
    o.authorized_email_domains,
    o.external_authorized_email_domains,
    o.created_at,
    o.updated_at,
    o.cached_libelle,
    o.cached_nom_complet,
    o.cached_enseigne,
    o.cached_tranche_effectifs,
    o.cached_tranche_effectifs_unite_legale,
    o.cached_libelle_tranche_effectif,
    o.cached_etat_administratif,
    o.cached_est_active,
    o.cached_statut_diffusion,
    o.cached_est_diffusible,
    o.cached_adresse,
    o.cached_code_postal,
    o.cached_code_officiel_geographique,
    o.cached_activite_principale,
    o.cached_libelle_activite_principale,
    o.cached_categorie_juridique,
    o.cached_libelle_categorie_juridique,
    o.organization_info_fetched_at
FROM moderations m
INNER JOIN organizations o on o.id = m.organization_id
WHERE m.user_id = $1
AND m.type = 'organization_join_block'
AND m.moderated_at IS NULL
ORDER BY m.created_at
`,
    [user_id],
  );

  return rows;
};
export const findByVerifiedEmailDomain = async (email_domain: string) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization> = await connection.query(
    `
SELECT id,
    siret,
    verified_email_domains,
    authorized_email_domains,
    external_authorized_email_domains,
    created_at,
    updated_at,
    cached_libelle,
    cached_nom_complet,
    cached_enseigne,
    cached_tranche_effectifs,
    cached_tranche_effectifs_unite_legale,
    cached_libelle_tranche_effectif,
    cached_etat_administratif,
    cached_est_active,
    cached_statut_diffusion,
    cached_est_diffusible,
    cached_adresse,
    cached_code_postal,
    cached_code_officiel_geographique,
    cached_activite_principale,
    cached_libelle_activite_principale,
    cached_categorie_juridique,
    cached_libelle_categorie_juridique,
    organization_info_fetched_at
FROM organizations
WHERE cached_est_active = 'true'
  AND $1 = ANY (verified_email_domains)`,
    [email_domain],
  );

  return rows;
};

export const getUsersByOrganization = async (
  organization_id: number,
  additionalWhereClause: string = "",
  additionalParams: any[] = [],
) => {
  const connection = getDatabaseConnection();
  const baseParams = [organization_id];

  const { rows }: QueryResult<User & BaseUserOrganizationLink> =
    await connection.query(
      `
SELECT
    u.*,
    uo.is_external,
    uo.verification_type,
    uo.authentication_by_peers_type,
    uo.has_been_greeted,
    uo.sponsor_id,
    uo.needs_official_contact_email_verification,
    uo.official_contact_email_verification_token,
    uo.official_contact_email_verification_sent_at
FROM users u
INNER JOIN users_organizations AS uo ON uo.user_id = u.id
WHERE uo.organization_id = $1
${additionalWhereClause}`,
      [...baseParams, ...additionalParams],
    );

  return rows;
};

export const getUsers = (organization_id: number) =>
  getUsersByOrganization(organization_id);

const inactiveThresholdDate = new Date(
  new Date().getTime() -
    MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES * 60e3,
);

export const getActiveUsers = (organization_id: number) =>
  getUsersByOrganization(
    organization_id,
    `
  AND uo.authentication_by_peers_type IS NOT NULL
  AND u.email_verified_at >= $2`,
    [inactiveThresholdDate],
  );

export const getInternalActiveUsers = (organization_id: number) =>
  getUsersByOrganization(
    organization_id,
    `
  AND uo.is_external = FALSE
  AND uo.authentication_by_peers_type IS NOT NULL
  AND u.email_verified_at >= $2`,
    [inactiveThresholdDate],
  );

export const getUserOrganizationLink = async (
  organization_id: number,
  user_id: number,
) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<UserOrganizationLink> = await connection.query(
    `
SELECT
  user_id,
  organization_id,
  is_external,
  created_at,
  updated_at,
  verification_type,
  authentication_by_peers_type,
  has_been_greeted,
  sponsor_id,
  needs_official_contact_email_verification,
  official_contact_email_verification_token,
  official_contact_email_verification_sent_at
FROM users_organizations
WHERE organization_id = $1 AND user_id = $2`,
    [organization_id, user_id],
  );

  return rows.shift();
};
