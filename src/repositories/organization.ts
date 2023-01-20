import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';

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
    o.cached_activite_principale,
    o.cached_libelle_activite_principale,
    o.cached_categorie_juridique,
    o.cached_libelle_categorie_juridique,
    o.organization_info_fetched_at
FROM moderations m
INNER JOIN organizations o on o.id = m.organization_id
INNER JOIN users u on u.id = m.user_id
WHERE u.id = $1
AND m.type = 'organization_join_block'
AND m.moderated_at IS NULL
ORDER BY m.created_at
`,
    [user_id]
  );

  return rows;
};

export const findBySiret = async (siret: string) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization> = await connection.query(
    `
SELECT
  id,
  siret,
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
  cached_activite_principale,
  cached_libelle_activite_principale,
  cached_categorie_juridique,
  cached_libelle_categorie_juridique,
  organization_info_fetched_at
FROM organizations WHERE siret = $1`,
    [siret]
  );

  return rows.shift();
};

export const findByEmailDomain = async (email_domain: string) => {
  const connection = getDatabaseConnection();

  const {
    rows,
  }: QueryResult<Organization & { count: number }> = await connection.query(
    `
SELECT
    sub.id,
    sub.siret,
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

export const create = async ({
  siret,
  organizationInfo: {
    libelle: cached_libelle,
    nomComplet: cached_nom_complet,
    enseigne: cached_enseigne,
    trancheEffectifs: cached_tranche_effectifs,
    trancheEffectifsUniteLegale: cached_tranche_effectifs_unite_legale,
    libelleTrancheEffectif: cached_libelle_tranche_effectif,
    etatAdministratif: cached_etat_administratif,
    estActive: cached_est_active,
    statutDiffusion: cached_statut_diffusion,
    estDiffusible: cached_est_diffusible,
    adresse: cached_adresse,
    codePostal: cached_code_postal,
    activitePrincipale: cached_activite_principale,
    libelleActivitePrincipale: cached_libelle_activite_principale,
    categorieJuridique: cached_categorie_juridique,
    libelleCategorieJuridique: cached_libelle_categorie_juridique,
  },
  authorized_email_domains,
  external_authorized_email_domains,
}: {
  siret: string;
  organizationInfo: OrganizationInfo;
  authorized_email_domains: string[];
  external_authorized_email_domains: string[];
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization> = await connection.query(
    `
INSERT INTO organizations
    (
     siret,
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
     cached_activite_principale,
     cached_libelle_activite_principale,
     cached_categorie_juridique,
     cached_libelle_categorie_juridique,
     organization_info_fetched_at,
     authorized_email_domains,
     external_authorized_email_domains, 
     updated_at,
     created_at
     )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
RETURNING *
`,
    [
      siret,
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
      cached_activite_principale,
      cached_libelle_activite_principale,
      cached_categorie_juridique,
      cached_libelle_categorie_juridique,
      new Date().toISOString(),
      authorized_email_domains,
      external_authorized_email_domains,
      new Date().toISOString(),
      new Date().toISOString(),
    ]
  );

  return rows.shift()!;
};

export const updateOrganizationInfo = async ({
  id,
  organizationInfo: {
    libelle: cached_libelle,
    nomComplet: cached_nom_complet,
    enseigne: cached_enseigne,
    trancheEffectifs: cached_tranche_effectifs,
    trancheEffectifsUniteLegale: cached_tranche_effectifs_unite_legale,
    libelleTrancheEffectif: cached_libelle_tranche_effectif,
    etatAdministratif: cached_etat_administratif,
    estActive: cached_est_active,
    statutDiffusion: cached_statut_diffusion,
    estDiffusible: cached_est_diffusible,
    adresse: cached_adresse,
    codePostal: cached_code_postal,
    activitePrincipale: cached_activite_principale,
    libelleActivitePrincipale: cached_libelle_activite_principale,
    categorieJuridique: cached_categorie_juridique,
    libelleCategorieJuridique: cached_libelle_categorie_juridique,
  },
}: {
  id: number;
  organizationInfo: OrganizationInfo;
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization> = await connection.query(
    `
UPDATE organizations
SET
    (
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
     cached_activite_principale,
     cached_libelle_activite_principale,
     cached_categorie_juridique,
     cached_libelle_categorie_juridique,
     organization_info_fetched_at
     ) = ($2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
WHERE id = $1 RETURNING *
`,
    [
      id,
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
      cached_activite_principale,
      cached_libelle_activite_principale,
      cached_categorie_juridique,
      cached_libelle_categorie_juridique,
      new Date().toISOString(),
    ]
  );

  return rows.shift();
};

export const addUser = async ({
  organization_id,
  user_id,
  is_external,
}: {
  organization_id: number;
  user_id: number;
  is_external: boolean;
}) => {
  const connection = getDatabaseConnection();

  try {
    await connection.query('BEGIN');

    await connection.query(
      `
INSERT INTO users_organizations
    (
     user_id,
     organization_id,
     is_external,
     updated_at,
     created_at
     )
VALUES ($1, $2, $3, $4, $5)`,
      [
        user_id,
        organization_id,
        is_external,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );

    await connection.query('COMMIT');

    return true;
  } catch (e) {
    await connection.query('ROLLBACK');
    throw e;
  }
};

export const getUsers = async (organization_id: number) => {
  const connection = getDatabaseConnection();

  const {
    rows,
  }: QueryResult<User & { is_external: boolean }> = await connection.query(
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
    uo.is_external
FROM users u
INNER JOIN users_organizations AS uo ON uo.user_id = u.id
WHERE uo.organization_id = $1`,
    [organization_id]
  );

  return rows;
};

export const deleteUserOrganisation = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const connection = getDatabaseConnection();

  const { rowCount } = await connection.query(
    `
DELETE FROM users_organizations
WHERE user_id = $1 AND organization_id = $2`,
    [user_id, organization_id]
  );

  return rowCount > 0;
};
