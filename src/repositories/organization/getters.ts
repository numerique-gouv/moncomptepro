import { getDatabaseConnection } from '../../connectors/postgres';
import { QueryResult } from 'pg';

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
    [id]
  );

  return rows.shift();
};
export const findByUserId = async (user_id: number) => {
  const connection = getDatabaseConnection();

  const {
    rows,
  }: QueryResult<Organization & {
    is_external: boolean;
  }> = await connection.query(
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
    uo.is_external
FROM organizations o
INNER JOIN users_organizations uo ON uo.organization_id = o.id
WHERE uo.user_id = $1
ORDER BY uo.created_at`,
    [user_id]
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
    [user_id]
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
    [email_domain]
  );

  return rows;
};
export const findByMostUsedEmailDomain = async (email_domain: string) => {
  const connection = getDatabaseConnection();

  const {
    rows,
  }: QueryResult<Organization & { count: number }> = await connection.query(
    `
SELECT
    sub.id,
    sub.siret,
    sub.verified_email_domains,
    sub.authorized_email_domains,
    sub.external_authorized_email_domains,
    sub.created_at,
    sub.updated_at,
    sub.cached_libelle,
    sub.cached_nom_complet,
    sub.cached_enseigne,
    sub.cached_tranche_effectifs,
    sub.cached_tranche_effectifs_unite_legale,
    sub.cached_libelle_tranche_effectif,
    sub.cached_etat_administratif,
    sub.cached_est_active,
    sub.cached_statut_diffusion,
    sub.cached_est_diffusible,
    sub.cached_adresse,
    sub.cached_code_postal,
    sub.cached_code_officiel_geographique,
    sub.cached_activite_principale,
    sub.cached_libelle_activite_principale,
    sub.cached_categorie_juridique,
    sub.cached_libelle_categorie_juridique,
    sub.organization_info_fetched_at,
    sub.count
FROM (SELECT o.*, substring(u.email from '@(.*)$') as domain, count(*)
      FROM users_organizations uo
               INNER JOIN organizations o on o.id = uo.organization_id
               INNER JOIN users u on u.id = uo.user_id
      WHERE o.cached_est_active = 'true'
      GROUP BY o.id, substring(u.email from '@(.*)$')
      HAVING count(*) >= 5
      ORDER BY count(*) DESC) sub
WHERE domain=$1`,
    [email_domain]
  );

  return rows;
};
export const getUsers = async (organization_id: number) => {
  const connection = getDatabaseConnection();

  const {
    rows,
  }: QueryResult<User & {
    is_external: boolean;
    verification_type: UserOrganizationLink['verification_type'];
  }> = await connection.query(
    `
SELECT
    u.id,
    u.email,
    u.encrypted_password,
    u.reset_password_token,
    u.reset_password_sent_at,
    u.sign_in_count,
    u.last_sign_in_at,
    u.created_at,
    u.updated_at,
    u.legacy_user,
    u.email_verified,
    u.verify_email_token,
    u.verify_email_sent_at,
    u.given_name,
    u.family_name,
    u.phone_number,
    u.job,
    u.magic_link_token,
    u.magic_link_sent_at,
    u.email_verified_at,
    uo.is_external,
    uo.verification_type
FROM users u
INNER JOIN users_organizations AS uo ON uo.user_id = u.id
WHERE uo.organization_id = $1`,
    [organization_id]
  );

  return rows;
};
