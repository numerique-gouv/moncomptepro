import { getDatabaseConnection } from '../connectors/postgres';

export const findByUserId = async user_id => {
  const connection = getDatabaseConnection();

  const { rows: results } = await connection.query(
    `
SELECT id, siret, users_organizations.is_external, cached_libelle as label
FROM organizations
INNER JOIN users_organizations ON users_organizations.organization_id = organizations.id
WHERE users_organizations.user_id = $1`,
    [user_id]
  );

  return results;
};

export const findBySiret = async siret => {
  const connection = getDatabaseConnection();

  const {
    rows: [result],
  } = await connection.query(`SELECT * FROM organizations WHERE siret = $1`, [
    siret,
  ]);

  return result;
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
}) => {
  const connection = getDatabaseConnection();

  const {
    rows: [organization],
  } = await connection.query(
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
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *
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

  return organization;
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
}) => {
  const connection = getDatabaseConnection();

  const {
    rows: [organization],
  } = await connection.query(
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

  return organization;
};

export const addUser = async ({ organization_id, user_id, is_external }) => {
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

export const getUsers = async organization_id => {
  const connection = getDatabaseConnection();

  const { rows: results } = await connection.query(
    `
SELECT * FROM users
INNER JOIN users_organizations AS uo ON uo.user_id = users.id
WHERE uo.organization_id = $1`,
    [organization_id]
  );

  return results;
};
