import axios from 'axios';

export const getOrganizationInfo = async siret => {
  try {
    const {
      data: { etablissement },
    } = await axios({
      method: 'get',
      url: `https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${siret}`,
    });

    return {
      siret: etablissement.siret,
      nom_raison_sociale: etablissement.unite_legale.denomination,
      tranche_effectifs: etablissement.tranche_effectifs,
      etat_administratif: etablissement.etat_administratif,
    };
  } catch (e) {
    throw e;
  }
};
