import { getOrganizationInfoFactory } from "@gouvfr-lasuite/proconnect.identite/organization";
import {
  InseeConnectionError,
  InseeNotFoundError,
} from "@gouvfr-lasuite/proconnect.insee/errors";
import type { InseeEtablissement } from "@gouvfr-lasuite/proconnect.insee/types";
import { AxiosError, type AxiosResponse } from "axios";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const assert = chai.assert;

describe("getOrganizationInfo", () => {
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
        Promise.resolve({
          adresseEtablissement: {
            numeroVoieEtablissement: "3",
            typeVoieEtablissement: "RUE",
            libelleVoieEtablissement: "MAISON DE VATIMESNIL",
            codePostalEtablissement: "27150",
            libelleCommuneEtablissement: "ETREPAGNY",
            codeCommuneEtablissement: "27226",
          },
          periodesEtablissement: [
            {
              activitePrincipaleEtablissement: "84.11Z",
              etatAdministratifEtablissement: "A",
            },
          ],
          siret: "20007184300060",
          statutDiffusionEtablissement: "O",
          trancheEffectifsEtablissement: "22",
          anneeEffectifsEtablissement: "2021",
          uniteLegale: {
            categorieJuridiqueUniteLegale: 7346,
            denominationUniteLegale: "Cc du vexin normand",
            trancheEffectifsUniteLegale: "22",
          },
        } as InseeEtablissement),
    });

    await assert.eventually.deepEqual(
      getOrganizationInfo("20007184300060"),
      diffusibleOrganizationInfo,
    );
  });

  it("should return valid payload for diffusible établissement", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () =>
        Promise.resolve({
          adresseEtablissement: {
            numeroVoieEtablissement: "3",
            typeVoieEtablissement: "RUE",
            libelleVoieEtablissement: "MAISON DE VATIMESNIL",
            codePostalEtablissement: "27150",
            libelleCommuneEtablissement: "ETREPAGNY",
            codeCommuneEtablissement: "27226",
          },
          periodesEtablissement: [
            {
              activitePrincipaleEtablissement: "84.11Z",
              etatAdministratifEtablissement: "A",
            },
          ],
          siret: "20007184300060",
          statutDiffusionEtablissement: "O",
          trancheEffectifsEtablissement: "22",
          anneeEffectifsEtablissement: "2021",
          uniteLegale: {
            categorieJuridiqueUniteLegale: 7346,
            denominationUniteLegale: "Cc du vexin normand",
            trancheEffectifsUniteLegale: "22",
          },
        } as InseeEtablissement),
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
        Promise.resolve({
          adresseEtablissement: {
            numeroVoieEtablissement: "12",
            typeVoieEtablissement: "AV",
            libelleVoieEtablissement: "DE LA GARE",
            codePostalEtablissement: "06220",
            libelleCommuneEtablissement: "VALLAURIS",
            codeCommuneEtablissement: "06155",
          },
          periodesEtablissement: [
            {
              activitePrincipaleEtablissement: "62.02A",
              etatAdministratifEtablissement: "A",
            },
          ],
          siret: "94957325700019",
          statutDiffusionEtablissement: "P",
          trancheEffectifsEtablissement: null,
          uniteLegale: {
            activitePrincipaleUniteLegale: "62.02A",
            categorieJuridiqueUniteLegale: 1000,
            trancheEffectifsUniteLegale: null,
            sexeUniteLegale: "M",
            nomUniteLegale: "DUBIGNY",
            prenom1UniteLegale: "RAPHAËL",
            prenomUsuelUniteLegale: "RAPHAËL",
          },
        } as InseeEtablissement),
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

  it("should throw on Axios 403 Http Error", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () =>
        Promise.reject(
          new AxiosError(undefined, undefined, undefined, undefined, {
            status: 403,
          } as AxiosResponse),
        ),
    });

    await assert.isRejected(
      getOrganizationInfo("53512638700013"),
      InseeNotFoundError,
    );
  });

  it("should throw on Axios 404 Http Error", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () =>
        Promise.reject(
          new AxiosError(undefined, undefined, undefined, undefined, {
            status: 404,
          } as AxiosResponse),
        ),
      findBySiret: () => Promise.reject(),
    });

    await assert.isRejected(
      getOrganizationInfo("200071843"),
      InseeNotFoundError,
    );
  });

  it("should throw a connecction error on Axios ECONNABORTED Error", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () =>
        Promise.reject(new AxiosError(undefined, AxiosError.ECONNABORTED)),
    });

    await assert.isRejected(
      getOrganizationInfo("53512638700013"),
      InseeConnectionError,
    );
  });

  it("should throw a connecction error on Axios ERR_BAD_RESPONSE Error", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () =>
        Promise.reject(new AxiosError(undefined, AxiosError.ERR_BAD_RESPONSE)),
    });

    await assert.isRejected(
      getOrganizationInfo("53512638700013"),
      InseeConnectionError,
    );
  });

  it("should throw a connecction error on Axios EAI_AGAIN Error", async () => {
    const getOrganizationInfo = getOrganizationInfoFactory({
      findBySiren: () => Promise.reject(),
      findBySiret: () => Promise.reject(new AxiosError(undefined, "EAI_AGAIN")),
    });

    await assert.isRejected(
      getOrganizationInfo("53512638700013"),
      InseeConnectionError,
    );
  });
});
