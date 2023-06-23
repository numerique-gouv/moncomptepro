import { getDatabaseConnection } from '../../connectors/postgres';
import { QueryResult } from 'pg';
import { hashToPostgresParams } from '../../services/hash-to-postgres-params';

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
      new Date(),
      new Date(),
      new Date(),
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
    [siret, domain, new Date()]
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
      new Date(),
      new Date(),
    ]
  );

  return rows.shift()!;
};

export const updateUserOrganizationLink = async (
  organization_id: number,
  user_id: number,
  fieldsToUpdate: Partial<BaseUserOrganizationLink>
) => {
  const connection = getDatabaseConnection();

  const fieldsToUpdateWithTimestamps = {
    ...fieldsToUpdate,
    updated_at: new Date(),
  };

  const { paramsString, valuesString, values } = hashToPostgresParams<User>(
    fieldsToUpdateWithTimestamps
  );

  const { rows }: QueryResult<UserOrganizationLink> = await connection.query(
    `
UPDATE users_organizations SET ${paramsString} = ${valuesString}
WHERE organization_id = $${values.length + 1}
AND user_id = $${values.length + 2} RETURNING *`,
    [...values, organization_id, user_id]
  );

  return rows.shift()!;
};

export const deleteUserOrganization = async ({
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
