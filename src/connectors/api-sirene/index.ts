import axios, { AxiosError } from 'axios';
import {
  formatAdresseEtablissement,
  formatEnseigne,
  formatNomComplet,
  libelleFromCategoriesJuridiques,
  libelleFromCodeEffectif,
  libelleFromCodeNaf,
} from './formatters';
import { InseeTimeoutError } from '../../errors';

const { INSEE_CONSUMER_KEY, INSEE_CONSUMER_SECRET } = process.env;
// we wait just enough to avoid nginx default timeout of 60 seconds
const REQUEST_TIMEOUT = 55 * 1000; // 55 seconds in milliseconds

export const getOrganizationInfo = async (
  siret: string
): Promise<OrganizationInfo | {}> => {
  try {
    const {
      data: { access_token },
    } = await axios.post(
      'https://api.insee.fr/token',
      'grant_type=client_credentials',
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: {
          username: INSEE_CONSUMER_KEY!,
          password: INSEE_CONSUMER_SECRET!,
        },
        timeout: REQUEST_TIMEOUT,
      }
    );

    const {
      data: { etablissement },
    } = await axios.get(
      `https://api.insee.fr/entreprises/sirene/V3/siret/${siret}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: REQUEST_TIMEOUT,
      }
    );

    const {
      siret: siretFromInseeApi,
      trancheEffectifsEtablissement,
      anneeEffectifsEtablissement,
      adresseEtablissement,
      statutDiffusionEtablissement,
      periodesEtablissement,
      uniteLegale,
    } = etablissement;

    if (statutDiffusionEtablissement === 'N') {
      return {};
    }

    const {
      categorieJuridiqueUniteLegale,
      denominationUniteLegale,
      sigleUniteLegale,
      nomUniteLegale,
      nomUsageUniteLegale,
      prenomUsuelUniteLegale,
      trancheEffectifsUniteLegale,
    } = uniteLegale;

    // get last period to obtain most recent data
    const {
      activitePrincipaleEtablissement,
      enseigne1Etablissement,
      enseigne2Etablissement,
      enseigne3Etablissement,
      etatAdministratifEtablissement,
    } = periodesEtablissement[0];

    const { codePostalEtablissement } = adresseEtablissement;

    const enseigne = formatEnseigne(
      enseigne1Etablissement,
      enseigne2Etablissement,
      enseigne3Etablissement
    );

    const nomComplet = formatNomComplet({
      denominationUniteLegale,
      prenomUsuelUniteLegale,
      nomUniteLegale,
      nomUsageUniteLegale,
      sigleUniteLegale,
    });

    const organizationLabel = `${nomComplet}${
      enseigne ? ` - ${enseigne}` : ''
    }`;

    return {
      siret: siretFromInseeApi,
      libelle: organizationLabel,
      nomComplet,
      enseigne,
      trancheEffectifs: trancheEffectifsEtablissement,
      trancheEffectifsUniteLegale,
      libelleTrancheEffectif: libelleFromCodeEffectif(
        trancheEffectifsEtablissement,
        anneeEffectifsEtablissement
      ),
      etatAdministratif: etatAdministratifEtablissement,
      estActive: etatAdministratifEtablissement === 'A',
      statutDiffusion: statutDiffusionEtablissement,
      estDiffusible: statutDiffusionEtablissement !== 'N',
      adresse: formatAdresseEtablissement(adresseEtablissement),
      codePostal: codePostalEtablissement,
      activitePrincipale: activitePrincipaleEtablissement,
      libelleActivitePrincipale: libelleFromCodeNaf(
        activitePrincipaleEtablissement
      ),
      categorieJuridique: categorieJuridiqueUniteLegale,
      libelleCategorieJuridique: libelleFromCategoriesJuridiques(
        categorieJuridiqueUniteLegale
      ),
    };
  } catch (e) {
    if (
      e instanceof AxiosError &&
      e.response &&
      [403, 404].includes(e.response.status)
    ) {
      return {};
    }

    if (e instanceof AxiosError && e.code === 'ECONNABORTED') {
      throw new InseeTimeoutError();
    }

    throw e;
  }
};
