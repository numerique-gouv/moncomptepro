import { isDomainValid } from "@gouvfr-lasuite/proconnect.core/security";
import type { Organization } from "../types/organization";

/**
 * These fonctions return approximate results. As the data tranche effectifs is
 * two years old. Consequently, an organization that growths quickly within the
 * first two years of his existence can be miss-identified as unipersonnelle by
 * this fonction.
 */
export const isEntrepriseUnipersonnelle = ({
  cached_libelle_categorie_juridique,
  cached_tranche_effectifs,
}: Organization): boolean => {
  // check that the organization has the right catégorie juridique
  const cat_jur_ok = [
    "Entrepreneur individuel",
    "Société à responsabilité limitée (sans autre indication)",
    "SAS, société par actions simplifiée",
  ].includes(cached_libelle_categorie_juridique || "");

  // check that the organization has the right tranche effectifs
  const tra_eff_ok = [null, "NN", "00", "01"].includes(
    cached_tranche_effectifs,
  );

  return cat_jur_ok && tra_eff_ok;
};
export const isSmallAssociation = ({
  cached_libelle_categorie_juridique,
  cached_tranche_effectifs,
}: Organization): boolean => {
  // check that the organization has the right catégorie juridique
  const cat_jur_ok = ["Association déclarée"].includes(
    cached_libelle_categorie_juridique || "",
  );

  // check that the organization has the right tranche effectifs
  const tra_eff_ok = [null, "NN", "00", "01", "02", "03", "11", "12"].includes(
    cached_tranche_effectifs,
  );

  return cat_jur_ok && tra_eff_ok;
};

export const isCommune = (
  { cached_libelle_categorie_juridique }: Organization,
  considerCommunauteDeCommunesAsCommune = false,
): boolean => {
  let cat_jur = [
    "Commune et commune nouvelle",
    "Commune associée et commune déléguée",
  ];

  if (considerCommunauteDeCommunesAsCommune) {
    cat_jur.push("Communauté de communes");
  }

  return cat_jur.includes(cached_libelle_categorie_juridique || "");
};

// inspired from https://github.com/etalab/annuaire-entreprises-search-infra/blob/c86bdb34ff6359de3a740ae2f1fa49133ddea362/data_enrichment.py#L104
export const isPublicService = ({
  cached_categorie_juridique,
  siret,
}: Organization): boolean => {
  const cat_jur_ok = ["4", "71", "72", "73", "74"].some((e) =>
    cached_categorie_juridique?.startsWith(e),
  );

  const siren = (siret || "").substring(0, 9);
  const whitelist_ok = ["320252489"].includes(siren);

  return cat_jur_ok || whitelist_ok;
};

export const hasLessThanFiftyEmployees = ({
  cached_tranche_effectifs,
}: Organization): boolean => {
  return [null, "NN", "00", "01", "02", "03", "11", "12"].includes(
    cached_tranche_effectifs,
  );
};

export const isWasteManagementOrganization = ({
  cached_libelle_activite_principale,
}: Organization): boolean => {
  if (!cached_libelle_activite_principale) {
    return false;
  }

  return [
    "38.11Z - Collecte des déchets non dangereux",
    "38.12Z - Collecte des déchets dangereux",
    "38.21Z - Traitement et élimination des déchets non dangereux",
    "38.22Z - Traitement et élimination des déchets dangereux",
    "38.31Z - Démantèlement d’épaves",
    "38.32Z - Récupération de déchets triés",
    "39.00Z - Dépollution et autres services de gestion des déchets",
  ].includes(cached_libelle_activite_principale);
};

export const isEtablissementScolaireDuPremierEtSecondDegre = ({
  cached_libelle_activite_principale,
  cached_libelle_categorie_juridique,
}: Organization) => {
  const isCollegeOuLyceePublic =
    (cached_libelle_activite_principale ===
      "85.31Z - Enseignement secondaire général" ||
      cached_libelle_activite_principale ===
        "85.32Z - Enseignement secondaire technique ou professionnel") &&
    cached_libelle_categorie_juridique ===
      "Établissement public local d'enseignement";

  // Temporarily disabled because contact data from annuaire education nationale
  // are not accurate enough.
  // const isCollegeOuLyceePrive =
  //   (cached_libelle_activite_principale ===
  //     "85.31Z - Enseignement secondaire général" ||
  //     cached_libelle_activite_principale ===
  //       "85.32Z - Enseignement secondaire technique ou professionnel") &&
  //   cached_libelle_categorie_juridique === "Association déclarée";

  const isEcolePrimairePublique =
    cached_libelle_activite_principale === "85.20Z - Enseignement primaire" &&
    cached_libelle_categorie_juridique === "Commune et commune nouvelle";

  // Temporarily disabled because contact data from annuaire education nationale
  // are not accurate enough.
  // const isEcolePrimairePrivee =
  //   cached_libelle_activite_principale === "85.20Z - Enseignement primaire" &&
  //   cached_libelle_categorie_juridique === "Association déclarée";

  const isEcoleMaternellePublique =
    cached_libelle_activite_principale ===
      "85.10Z - Enseignement pré-primaire" &&
    cached_libelle_categorie_juridique === "Commune et commune nouvelle";

  return (
    isCollegeOuLyceePublic ||
    isEcolePrimairePublique ||
    isEcoleMaternellePublique
  );
};

export const isEducationNationaleDomain = (domain: string) => {
  if (!isDomainValid(domain)) {
    return false;
  }

  return domain.match(/^ac-[a-zA-Z0-9-]*\.fr$/) !== null;
};

export const getOrganizationTypeLabel = (organization: Organization) => {
  if (isEtablissementScolaireDuPremierEtSecondDegre(organization)) {
    return "établissement scolaire";
  } else {
    if (isCommune(organization)) {
      return "mairie";
    }

    if (isPublicService(organization)) {
      return "service";
    }
  }

  if (
    isEntrepriseUnipersonnelle(organization) &&
    isWasteManagementOrganization(organization)
  ) {
    return "entreprise";
  }

  return "organisation";
};
