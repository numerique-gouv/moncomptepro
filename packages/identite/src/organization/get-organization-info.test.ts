import { InseeNotFoundError } from "@gouvfr-lasuite/proconnect.insee/errors";
import type { InseeEtablissement } from "@gouvfr-lasuite/proconnect.insee/types";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import diffusible from "./__mocks__/diffusible.json" with { type: "json" };
import partiallyNonDiffusible from "./__mocks__/partially-non-diffusible.json" with { type: "json" };
import searchBySiren from "./__mocks__/search-by-siren.json" with { type: "json" };
import { getOrganizationInfoFactory } from "./get-organization-info.js";

chai.use(chaiAsPromised);
const assert = chai.assert;

describe("getOrganizationInfo", () => {
  beforeEach(() => {
    nock("https://api.insee.fr").post("/token").reply(200, {
      access_token: "08e42802-9ac9-3403-a2a9-b5be11ce446c",
      scope: "am_application_scope default",
      token_type: "Bearer",
      expires_in: 521596,
    });
  });

  const diffusibleOrganizationInfo = {
    siret: "20007184300060",
    libelle: "Cc du vexin normand",
    nomComplet: "Cc du vexin normand",
    enseigne: "",
    trancheEffectifs: "22",
    trancheEffectifsUniteLegale: "22",
    libelleTrancheEffectif: "100 à 199 salariés, en 2021",
    etatAdministratif: "A",
    estActive: true,
    statutDiffusion: "O",
    estDiffusible: true,
    adresse: "3 rue maison de vatimesnil, 27150 Etrepagny",
    codePostal: "27150",
    codeOfficielGeographique: "27226",
    activitePrincipale: "84.11Z",
    libelleActivitePrincipale: "84.11Z - Administration publique générale",
    categorieJuridique: "7346",
    libelleCategorieJuridique: "Communauté de communes",
  };

  it("should return valid payload for diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () =>
        Promise.resolve(diffusible.etablissement as any as InseeEtablissement),
    });
    await assert.eventually.deepEqual(
      getOrganizationInfo("20007184300060"),
      diffusibleOrganizationInfo,
    );
  });

  it("should return valid payload for diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () =>
        Promise.resolve(
          searchBySiren.etablissements[0] as any as InseeEtablissement,
        ),
      findBySiret: () => Promise.reject(),
    });
    await assert.eventually.deepEqual(
      getOrganizationInfo("200071843"),
      diffusibleOrganizationInfo,
    );
  });

  it("should show partial data for partially non diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () =>
        Promise.resolve(
          partiallyNonDiffusible.etablissement as any as InseeEtablissement,
        ),
    });

    await assert.eventually.deepEqual(getOrganizationInfo("94957325700019"), {
      siret: "94957325700019",
      libelle: "Nom inconnu",
      nomComplet: "Nom inconnu",
      enseigne: "",
      trancheEffectifs: null,
      trancheEffectifsUniteLegale: null,
      libelleTrancheEffectif: "",
      etatAdministratif: "A",
      estActive: true,
      statutDiffusion: "P",
      estDiffusible: false,
      adresse: "06220 Vallauris",
      codePostal: "06220",
      codeOfficielGeographique: "06155",
      activitePrincipale: "62.02A",
      libelleActivitePrincipale:
        "62.02A - Conseil en systèmes et logiciels informatiques",
      categorieJuridique: "1000",
      libelleCategorieJuridique: "Entrepreneur individuel",
    });
  });

  it("should throw for totally non diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () =>
        Promise.resolve({
          statutDiffusionEtablissement: "N",
        } as InseeEtablissement),
    });
    await assert.isRejected(
      getOrganizationInfo("53512638700013"),
      InseeNotFoundError,
    );
  });
});
