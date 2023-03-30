import { getDatabaseConnection } from '../connectors/postgres';
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

export const upsert = async ({
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
    codeOfficielGeographique: cached_code_officiel_geographique,
    activitePrincipale: cached_activite_principale,
    libelleActivitePrincipale: cached_libelle_activite_principale,
    categorieJuridique: cached_categorie_juridique,
    libelleCategorieJuridique: cached_libelle_categorie_juridique,
  },
}: {
  siret: string;
  organizationInfo: OrganizationInfo;
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
        cached_code_officiel_geographique,
        cached_activite_principale,
        cached_libelle_activite_principale,
        cached_categorie_juridique,
        cached_libelle_categorie_juridique,
        organization_info_fetched_at,
        updated_at,
        created_at
    )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
ON CONFLICT (siret)
DO UPDATE
    SET (
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
        cached_code_officiel_geographique,
        cached_activite_principale,
        cached_libelle_activite_principale,
        cached_categorie_juridique,
        cached_libelle_categorie_juridique,
        organization_info_fetched_at,
        updated_at
    ) = (
        EXCLUDED.siret,
        EXCLUDED.cached_libelle,
        EXCLUDED.cached_nom_complet,
        EXCLUDED.cached_enseigne,
        EXCLUDED.cached_tranche_effectifs,
        EXCLUDED.cached_tranche_effectifs_unite_legale,
        EXCLUDED.cached_libelle_tranche_effectif,
        EXCLUDED.cached_etat_administratif,
        EXCLUDED.cached_est_active,
        EXCLUDED.cached_statut_diffusion,
        EXCLUDED.cached_est_diffusible,
        EXCLUDED.cached_adresse,
        EXCLUDED.cached_code_postal,
        EXCLUDED.cached_code_officiel_geographique,
        EXCLUDED.cached_activite_principale,
        EXCLUDED.cached_libelle_activite_principale,
        EXCLUDED.cached_categorie_juridique,
        EXCLUDED.cached_libelle_categorie_juridique,
        EXCLUDED.organization_info_fetched_at,
        EXCLUDED.updated_at
    )
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
      cached_code_officiel_geographique,
      cached_activite_principale,
      cached_libelle_activite_principale,
      cached_categorie_juridique,
      cached_libelle_categorie_juridique,
      new Date().toISOString(),
      new Date().toISOString(),
      new Date().toISOString(),
    ]
  );

  return rows.shift()!;
};

const addDomain = async ({
  siret,
  domain,
  listName,
}: {
  siret: string;
  domain: string;
  listName: 'verified_email_domains' | 'authorized_email_domains';
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization> = await connection.query(
    `
UPDATE organizations
SET ${listName} = array_append(${listName}, $2)
  , updated_at               = $3
WHERE siret = $1
RETURNING *
    `,
    [siret, domain, new Date().toISOString()]
  );

  return rows.shift()!;
};

export const addAuthorizedDomain = async ({
  siret,
  domain,
}: {
  siret: string;
  domain: string;
}) => {
  return await addDomain({
    siret,
    domain,
    listName: 'authorized_email_domains',
  });
};
export const addVerifiedDomain = async ({
  siret,
  domain,
}: {
  siret: string;
  domain: string;
}) => {
  return await addDomain({ siret, domain, listName: 'verified_email_domains' });
};

export const linkUserToOrganization = async ({
  organization_id,
  user_id,
  is_external = false,
  verification_type,
}: {
  organization_id: number;
  user_id: number;
  is_external?: boolean;
  verification_type: UserOrganizationLink['verification_type'];
}): Promise<UserOrganizationLink> => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<UserOrganizationLink> = await connection.query(
    `
INSERT INTO users_organizations
    (user_id,
     organization_id,
     is_external,
     verification_type,
     updated_at,
     created_at)
VALUES
    ($1, $2, $3, $4, $5, $6)
RETURNING *`,
    [
      user_id,
      organization_id,
      is_external,
      verification_type,
      new Date().toISOString(),
      new Date().toISOString(),
    ]
  );

  return rows.shift()!;
};

export const setVerificationType = async ({
  organization_id,
  user_id,
  verification_type,
}: {
  organization_id: number;
  user_id: number;
  verification_type: UserOrganizationLink['verification_type'];
}): Promise<UserOrganizationLink> => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<UserOrganizationLink> = await connection.query(
    `
UPDATE users_organizations
SET verification_type = $3
WHERE organization_id = $1 AND user_id = $2
`,
    [organization_id, user_id, verification_type]
  );

  return rows.shift()!;
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
