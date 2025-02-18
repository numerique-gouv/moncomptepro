import type { Organization } from "@gouvfr-lasuite/proconnect.identite/types";
import { describe, expect, it } from "vitest";
import {
  isCommune,
  isEducationNationaleDomain,
  isEntrepriseUnipersonnelle,
  isEtablissementScolaireDuPremierEtSecondDegre,
  isPublicService,
  isSmallAssociation,
  isWasteManagementOrganization,
} from "../src/services/organization";

const association_org_info = {
  siret: "83511518900010",
  cached_tranche_effectifs: "00",
  cached_tranche_effectifs_unite_legale: "00",
  cached_libelle_tranche_effectif:
    "0 salarié (n'ayant pas d'effectif au 31/12 mais ayant employé des salariés au cours de l'année de référence), en 2020",
  cached_activite_principale: "81.21Z",
  cached_libelle_activite_principale:
    "81.21Z - Nettoyage courant des bâtiments",
  cached_categorie_juridique: "9220",
  cached_libelle_categorie_juridique: "Association déclarée",
} as Organization;

const small_association_org_info = {
  siret: "39399933900046",
  cached_tranche_effectifs: "12",
  cached_tranche_effectifs_unite_legale: "12",
  cached_libelle_tranche_effectif: "20 à 49 salariés, en 2022",
  cached_activite_principale: "84.13Z",
  cached_libelle_activite_principale:
    "84.13Z - Administration publique (tutelle) des activités économiques",
  cached_categorie_juridique: "9220",
  cached_libelle_categorie_juridique: "Association déclarée",
} as Organization;

const entreprise_unipersonnelle_org_info = {
  siret: "82869625200018",
  cached_tranche_effectifs: null,
  cached_tranche_effectifs_unite_legale: null,
  cached_libelle_tranche_effectif: null,
  cached_activite_principale: "62.01Z",
  cached_libelle_activite_principale: "62.01Z - Programmation informatique",
  cached_categorie_juridique: "1000",
  cached_libelle_categorie_juridique: "Entrepreneur individuel",
} as Organization;

describe("isEntrepriseUnipersonnelle", () => {
  it("should return false for bad call", () => {
    expect(isEntrepriseUnipersonnelle({} as Organization)).toBeFalsy();
  });

  it("should return true for unipersonnelle organization", () => {
    expect(
      isEntrepriseUnipersonnelle(entreprise_unipersonnelle_org_info),
    ).toBeTruthy();
  });

  it("should return false for association", () => {
    expect(isEntrepriseUnipersonnelle(association_org_info)).toBeFalsy();
  });

  it("should return false for small association", () => {
    expect(isEntrepriseUnipersonnelle(small_association_org_info)).toBeFalsy();
  });
});

describe("isSmallAssociation", () => {
  it("should return false for bad call", () => {
    expect(isSmallAssociation({} as Organization)).toBeFalsy();
  });

  it("should return false for unipersonnelle organization", () => {
    expect(isSmallAssociation(entreprise_unipersonnelle_org_info)).toBeFalsy();
  });

  it("should return true for association", () => {
    expect(isSmallAssociation(association_org_info)).toBeTruthy();
  });

  it("should return true for small association", () => {
    expect(isSmallAssociation(small_association_org_info)).toBeTruthy();
  });
});

const lamalou_org_info = {
  siret: "21340126800130",
  cached_tranche_effectifs: "12",
  cached_tranche_effectifs_unite_legale: "21",
  cached_libelle_tranche_effectif: "20 à 49 salariés, en 2020",
  cached_activite_principale: "84.11Z",
  cached_libelle_activite_principale:
    "84.11Z - Administration publique générale",
  cached_categorie_juridique: "7210",
  cached_libelle_categorie_juridique: "Commune et commune nouvelle",
} as Organization;

const dinum_org_info = {
  siret: "13002526500013",
  cached_tranche_effectifs: "22",
  cached_tranche_effectifs_unite_legale: "22",
  cached_libelle_tranche_effectif: "100 à 199 salariés, en 2020",
  cached_activite_principale: "84.11Z",
  cached_libelle_activite_principale:
    "84.11Z - Administration publique générale",
  cached_categorie_juridique: "7120",
  cached_libelle_categorie_juridique: "Service central d'un ministère",
} as Organization;

const onf_org_info = {
  siret: "66204311604119",
  cached_tranche_effectifs: null,
  cached_tranche_effectifs_unite_legale: "52",
  cached_libelle_tranche_effectif: null,
  cached_activite_principale: "02.40Z",
  cached_libelle_activite_principale:
    "02.40Z - Services de soutien à l’exploitation forestière",
  cached_categorie_juridique: "4110",
  cached_libelle_categorie_juridique:
    "Établissement public national à caractère industriel ou commercial doté d'un comptable public",
} as Organization;

const whitelisted_org_info = {
  siret: "32025248901075",
  cached_tranche_effectifs: "42",
  cached_tranche_effectifs_unite_legale: "51",
  cached_libelle_tranche_effectif: "1 000 à 1 999 salariés, en 2021",
  cached_activite_principale: "64.92Z",
  cached_libelle_activite_principale: "64.92Z - Autre distribution de crédit",
  cached_categorie_juridique: "5599",
  cached_libelle_categorie_juridique: "SA à conseil d'administration (s.a.i.)",
} as Organization;

describe("isCommune", () => {
  it("should return false for bad call", () => {
    expect(isCommune({} as Organization)).toBeFalsy();
  });

  it("should return true for collectivite territoriale", () => {
    expect(isCommune(lamalou_org_info)).toBeTruthy();
  });

  it("should return false for administration centrale", () => {
    expect(isCommune(dinum_org_info)).toBeFalsy();
  });
});

const trackdechets_public_org_info = {
  siret: "25680169700010",
  cached_tranche_effectifs: "NN",
  cached_tranche_effectifs_unite_legale: "NN",
  cached_libelle_tranche_effectif:
    "Unité non employeuse (pas de salarié au cours de l'année de référence et pas d'effectif au 31/12)",
  cached_activite_principale: "38.21Z",
  cached_libelle_activite_principale:
    "38.21Z - Traitement et élimination des déchets non dangereux",
  cached_categorie_juridique: "7354",
  cached_libelle_categorie_juridique: "Syndicat mixte fermé",
} as Organization;

describe("isPublicService", () => {
  it("should return false for bad call", () => {
    expect(isPublicService({} as Organization)).toBeFalsy();
  });

  it("should return true for collectivite territoriale", () => {
    expect(isPublicService(lamalou_org_info)).toBeTruthy();
  });

  it("should return true for administration centrale", () => {
    expect(isPublicService(dinum_org_info)).toBeTruthy();
  });

  it("should return false for unipersonnelle organization", () => {
    expect(isPublicService(entreprise_unipersonnelle_org_info)).toBeFalsy();
  });

  it("should return false for association", () => {
    expect(isPublicService(association_org_info)).toBeFalsy();
  });

  it("should return true for établissement public à caractère industriel et commercial", () => {
    expect(isPublicService(onf_org_info)).toBeTruthy();
  });

  it("should return true for whitelisted établissement", () => {
    expect(isPublicService(whitelisted_org_info)).toBeTruthy();
  });

  it("should return true for public etablissement", () => {
    expect(isPublicService(trackdechets_public_org_info)).toBeTruthy();
  });
});

describe("isWasteManagementOrganization", () => {
  it("should return false for collectivité territoriale", () => {
    expect(isWasteManagementOrganization(lamalou_org_info)).toBeFalsy();
  });

  it("should return true for waste management organization", () => {
    expect(
      isWasteManagementOrganization(trackdechets_public_org_info),
    ).toBeTruthy();
  });
});

describe("isEtablissementScolaireDuPremierEtSecondDegre", () => {
  it("should return false for unipersonnelle organization", () => {
    const indep_org_info = {
      siret: "90243432300017",
      cached_tranche_effectifs: null,
      cached_tranche_effectifs_unite_legale: null,
      cached_libelle_tranche_effectif: null,
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "1000 ",
      cached_libelle_categorie_juridique: "Entrepreneur individuel",
    } as Organization;
    expect(
      isEtablissementScolaireDuPremierEtSecondDegre(indep_org_info),
    ).toBeFalsy();
  });
  it("should return true for lycee public", () => {
    const lycee_public_org_info = {
      siret: "19500016100016",
      cached_libelle: "Lycee general et technologique jean francois millet",
      cached_nom_complet: "Lycee general et technologique jean francois millet",
      cached_enseigne: "",
      cached_tranche_effectifs: "22",
      cached_tranche_effectifs_unite_legale: "22",
      cached_libelle_tranche_effectif: "100 à 199 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: "true",
      cached_statut_diffusion: "O",
      cached_est_diffusible: "true",
      cached_adresse: "1 rue bougainville, 50130 Cherbourg-en-cotentin",
      cached_code_postal: "50130",
      cached_code_officiel_geographique: "50129",
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "7331",
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
    } as Organization;
    expect(
      isEtablissementScolaireDuPremierEtSecondDegre(lycee_public_org_info),
    ).toBeTruthy();
  });
  it("should return true for college public", () => {
    const college_public_org_info = {
      siret: "19120032800018",
      cached_libelle: "College albert camus",
      cached_nom_complet: "College albert camus",
      cached_enseigne: "",
      cached_tranche_effectifs: "21",
      cached_tranche_effectifs_unite_legale: "21",
      cached_libelle_tranche_effectif: "50 à 99 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: "true",
      cached_statut_diffusion: "O",
      cached_est_diffusible: "true",
      cached_adresse: "114 rue de la vallee du viaur, 12160 Baraqueville",
      cached_code_postal: "12160",
      cached_code_officiel_geographique: "12056",
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "7331",
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
    } as Organization;
    expect(
      isEtablissementScolaireDuPremierEtSecondDegre(college_public_org_info),
    ).toBeTruthy();
  });
  it("should return false for lycee prive", () => {
    const lycee_prive_org_info = {
      siret: "31458546400014",
      cached_libelle: "Ogec maitrise de massabielle",
      cached_nom_complet: "Ogec maitrise de massabielle",
      cached_enseigne: "",
      cached_tranche_effectifs: "21",
      cached_tranche_effectifs_unite_legale: "22",
      cached_libelle_tranche_effectif: "50 à 99 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: "true",
      cached_statut_diffusion: "O",
      cached_est_diffusible: "true",
      cached_adresse: "29 faubourg victor hugo, 97110 Pointe-à-pitre",
      cached_code_postal: "97110",
      cached_code_officiel_geographique: "97120",
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "9220",
      cached_libelle_categorie_juridique: "Association déclarée",
    } as Organization;
    expect(
      isEtablissementScolaireDuPremierEtSecondDegre(lycee_prive_org_info),
    ).toBeFalsy();
  });
  it("should return true for ecole primaire publique", () => {
    const ecole_primaire_publique_org_info: Organization = {
      siret: "21590009300273",
      cached_libelle:
        "Commune de villeneuve d ascq - Ecole primaire publique calmette",
      cached_nom_complet: "Commune de villeneuve d ascq",
      cached_enseigne: "Ecole primaire publique calmette",
      cached_tranche_effectifs: "11",
      cached_tranche_effectifs_unite_legale: "42",
      cached_libelle_tranche_effectif: "10 à 19 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: "true",
      cached_statut_diffusion: "O",
      cached_est_diffusible: "true",
      cached_adresse: "48 rue de la contrescarpe, 59650 Villeneuve d'ascq",
      cached_code_postal: "59650",
      cached_code_officiel_geographique: "59009",
      cached_activite_principale: "85.20Z",
      cached_libelle_activite_principale: "85.20Z - Enseignement primaire",
      cached_categorie_juridique: "7210",
      cached_libelle_categorie_juridique: "Commune et commune nouvelle",
    } as Organization;
    expect(
      isEtablissementScolaireDuPremierEtSecondDegre(
        ecole_primaire_publique_org_info,
      ),
    ).toBeTruthy();
  });
  it("should return false for ecole primaire privee", () => {
    const ecole_primaire_privee_org_info = {
      siret: "39945558300027",
      cached_libelle:
        "Groupe scolaire ste genevieve st joseph (OGEC) - Ecoles primaires ste genevieve st joseph",
      cached_nom_complet: "Groupe scolaire ste genevieve st joseph (OGEC)",
      cached_enseigne: "Ecoles primaires ste genevieve st joseph",
      cached_tranche_effectifs: "11",
      cached_tranche_effectifs_unite_legale: "22",
      cached_libelle_tranche_effectif: "10 à 19 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: "true",
      cached_statut_diffusion: "O",
      cached_est_diffusible: "true",
      cached_adresse: "1 rue sarrus, 12000 Rodez",
      cached_code_postal: "12000",
      cached_code_officiel_geographique: "12202",
      cached_activite_principale: "85.20Z",
      cached_libelle_activite_principale: "85.20Z - Enseignement primaire",
      cached_categorie_juridique: "9220",
      cached_libelle_categorie_juridique: "Association déclarée",
    } as Organization;
    expect(
      isEtablissementScolaireDuPremierEtSecondDegre(
        ecole_primaire_privee_org_info,
      ),
    ).toBeFalsy();
  });
});

describe("isEducationNationaleDomain", () => {
  ["zac-orleans.fr", "ac-bordeaux.fr.net", "ac-bordeaux.gouv.fr"].forEach(
    (domain) => {
      it("should return false for non educ nat domain", () => {
        expect(isEducationNationaleDomain(domain)).toBeFalsy();
      });
    },
  );
  ["ac-orleans-tours.fr", "ac-bordeaux.fr"].forEach((domain) => {
    it("should return true for educ nat domain", () => {
      expect(isEducationNationaleDomain(domain)).toBeTruthy();
    });
  });
});
