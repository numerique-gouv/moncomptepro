import { assert } from "chai";
import {
  isCommune,
  isEducationNationaleDomain,
  isEntrepriseUnipersonnelle,
  isEtablissementScolaireDuPremierEtSecondDegre,
  isServicePublic,
} from "../src/services/organization";
import { describe } from "node:test";

const association_org_info: Organization = {
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
};

const entreprise_unipersonnelle_org_info: Organization = {
  siret: "81801912700021",
  cached_tranche_effectifs: null,
  cached_tranche_effectifs_unite_legale: null,
  cached_libelle_tranche_effectif: null,
  cached_activite_principale: "62.01Z",
  cached_libelle_activite_principale: "62.01Z - Programmation informatique",
  cached_categorie_juridique: "1000",
  cached_libelle_categorie_juridique: "Entrepreneur individuel",
};

describe("isEntrepriseUnipersonnelle", () => {
  it("should return false for bad call", () => {
    assert.equal(isEntrepriseUnipersonnelle({}), false);
  });

  it("should return true for unipersonnelle organization", () => {
    assert.equal(
      isEntrepriseUnipersonnelle(entreprise_unipersonnelle_org_info),
      true,
    );
  });

  it("should return false for association", () => {
    assert.equal(isEntrepriseUnipersonnelle(association_org_info), false);
  });
});

const lamalou_org_info: Organization = {
  siret: "21340126800130",
  cached_tranche_effectifs: "12",
  cached_tranche_effectifs_unite_legale: "21",
  cached_libelle_tranche_effectif: "20 à 49 salariés, en 2020",
  cached_activite_principale: "84.11Z",
  cached_libelle_activite_principale:
    "84.11Z - Administration publique générale",
  cached_categorie_juridique: "7210",
  cached_libelle_categorie_juridique: "Commune et commune nouvelle",
};

const dinum_org_info: Organization = {
  siret: "13002526500013",
  cached_tranche_effectifs: "22",
  cached_tranche_effectifs_unite_legale: "22",
  cached_libelle_tranche_effectif: "100 à 199 salariés, en 2020",
  cached_activite_principale: "84.11Z",
  cached_libelle_activite_principale:
    "84.11Z - Administration publique générale",
  cached_categorie_juridique: "7120",
  cached_libelle_categorie_juridique: "Service central d'un ministère",
};

const onf_org_info: Organization = {
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
};

describe("isCommune", () => {
  it("should return false for bad call", () => {
    assert.equal(isCommune({}), false);
  });

  it("should return true for collectivite territoriale", () => {
    assert.equal(isCommune(lamalou_org_info), true);
  });

  it("should return false for administration centrale", () => {
    assert.equal(isCommune(dinum_org_info), false);
  });
});

describe("isServicePublic", () => {
  it("should return false for bad call", () => {
    assert.equal(isServicePublic({}), false);
  });

  it("should return true for collectivite territoriale", () => {
    assert.equal(isServicePublic(lamalou_org_info), true);
  });

  it("should return true for administration centrale", () => {
    assert.equal(isServicePublic(dinum_org_info), true);
  });

  it("should return false for unipersonnelle organization", () => {
    assert.equal(isServicePublic(entreprise_unipersonnelle_org_info), false);
  });

  it("should return false for association", () => {
    assert.equal(isServicePublic(association_org_info), false);
  });

  it("should return false for établissement public à caractère industriel et commercial", () => {
    assert.equal(isServicePublic(onf_org_info), true);
  });
});

describe("isEtablissementScolaireDuPremierEtSecondDegre", () => {
  it("should return false for unipersonnelle organization", () => {
    const indep_org_info: Organization = {
      siret: "90243432300017",
      cached_tranche_effectifs: null,
      cached_tranche_effectifs_unite_legale: null,
      cached_libelle_tranche_effectif: null,
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "1000 ",
      cached_libelle_categorie_juridique: "Entrepreneur individuel",
    };
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(indep_org_info),
      false,
    );
  });
  it("should return true for lycee public", () => {
    const lycee_public_org_info: Organization = {
      siret: "19500016100016",
      cached_libelle: "Lycee general et technologique jean francois millet",
      cached_nom_complet: "Lycee general et technologique jean francois millet",
      cached_enseigne: "",
      cached_tranche_effectifs: "22",
      cached_tranche_effectifs_unite_legale: "22",
      cached_libelle_tranche_effectif: "100 à 199 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: true,
      cached_statut_diffusion: "O",
      cached_est_diffusible: true,
      cached_adresse: "1 rue bougainville, 50130 Cherbourg-en-cotentin",
      cached_code_postal: "50130",
      cached_code_officiel_geographique: "50129",
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "7331",
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
    };
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(lycee_public_org_info),
      true,
    );
  });
  it("should return true for college public", () => {
    const college_public_org_info: Organization = {
      siret: "19120032800018",
      cached_libelle: "College albert camus",
      cached_nom_complet: "College albert camus",
      cached_enseigne: "",
      cached_tranche_effectifs: "21",
      cached_tranche_effectifs_unite_legale: "21",
      cached_libelle_tranche_effectif: "50 à 99 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: true,
      cached_statut_diffusion: "O",
      cached_est_diffusible: true,
      cached_adresse: "114 rue de la vallee du viaur, 12160 Baraqueville",
      cached_code_postal: "12160",
      cached_code_officiel_geographique: "12056",
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "7331",
      cached_libelle_categorie_juridique:
        "Établissement public local d'enseignement",
    };
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(college_public_org_info),
      true,
    );
  });
  it("should return true for lycee prive", () => {
    const lycee_prive_org_info: Organization = {
      siret: "31458546400014",
      cached_libelle: "Ogec maitrise de massabielle",
      cached_nom_complet: "Ogec maitrise de massabielle",
      cached_enseigne: "",
      cached_tranche_effectifs: "21",
      cached_tranche_effectifs_unite_legale: "22",
      cached_libelle_tranche_effectif: "50 à 99 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: true,
      cached_statut_diffusion: "O",
      cached_est_diffusible: true,
      cached_adresse: "29 faubourg victor hugo, 97110 Pointe-à-pitre",
      cached_code_postal: "97110",
      cached_code_officiel_geographique: "97120",
      cached_activite_principale: "85.31Z",
      cached_libelle_activite_principale:
        "85.31Z - Enseignement secondaire général",
      cached_categorie_juridique: "9220",
      cached_libelle_categorie_juridique: "Association déclarée",
    };
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(lycee_prive_org_info),
      true,
    );
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
      cached_est_active: true,
      cached_statut_diffusion: "O",
      cached_est_diffusible: true,
      cached_adresse: "48 rue de la contrescarpe, 59650 Villeneuve d'ascq",
      cached_code_postal: "59650",
      cached_code_officiel_geographique: "59009",
      cached_activite_principale: "85.20Z",
      cached_libelle_activite_principale: "85.20Z - Enseignement primaire",
      cached_categorie_juridique: "7210",
      cached_libelle_categorie_juridique: "Commune et commune nouvelle",
    };
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(
        ecole_primaire_publique_org_info,
      ),
      true,
    );
  });
  it("should return true for ecole primaire privee", () => {
    const ecole_primaire_privee_org_info: Organization = {
      siret: "39945558300027",
      cached_libelle:
        "Groupe scolaire ste genevieve st joseph (OGEC) - Ecoles primaires ste genevieve st joseph",
      cached_nom_complet: "Groupe scolaire ste genevieve st joseph (OGEC)",
      cached_enseigne: "Ecoles primaires ste genevieve st joseph",
      cached_tranche_effectifs: "11",
      cached_tranche_effectifs_unite_legale: "22",
      cached_libelle_tranche_effectif: "10 à 19 salariés, en 2020",
      cached_etat_administratif: "A",
      cached_est_active: true,
      cached_statut_diffusion: "O",
      cached_est_diffusible: true,
      cached_adresse: "1 rue sarrus, 12000 Rodez",
      cached_code_postal: "12000",
      cached_code_officiel_geographique: "12202",
      cached_activite_principale: "85.20Z",
      cached_libelle_activite_principale: "85.20Z - Enseignement primaire",
      cached_categorie_juridique: "9220",
      cached_libelle_categorie_juridique: "Association déclarée",
    };
    assert.equal(
      isEtablissementScolaireDuPremierEtSecondDegre(
        ecole_primaire_privee_org_info,
      ),
      true,
    );
  });
});

describe("isEducationNationaleDomain", () => {
  ["zac-orleans.fr", "ac-bordeaux.fr.net", "ac-bordeaux.gouv.fr"].forEach(
    (domain) => {
      it("should return false for non educ nat domain", () => {
        assert.equal(isEducationNationaleDomain(domain), false);
      });
    },
  );
  ["ac-orleans-tours.fr", "ac-bordeaux.fr"].forEach((domain) => {
    it("should return true for educ nat domain", () => {
      assert.equal(isEducationNationaleDomain(domain), true);
    });
  });
});
