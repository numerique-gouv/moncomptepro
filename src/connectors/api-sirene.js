import axios from 'axios';

export const getOrganizationInfo = async siret => {
  try {
    const {
      data: { etablissement },
    } = await axios({
      method: 'get',
      url: `https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${siret}`,
    });

    const nom = etablissement.unite_legale.nom;
    const prenom_1 = etablissement.unite_legale.prenom_1;
    const prenom_2 = etablissement.unite_legale.prenom_2;
    const prenom_3 = etablissement.unite_legale.prenom_3;
    const prenom_4 = etablissement.unite_legale.prenom_4;
    const nom_prenom =
      (nom ? nom + '*' : '') +
      (prenom_1 ? prenom_1 : '') +
      (prenom_2 ? ' ' + prenom_2 : '') +
      (prenom_3 ? ' ' + prenom_3 : '') +
      (prenom_4 ? ' ' + prenom_4 : '');
    const organization_label =
      etablissement.unite_legale.denomination ||
      etablissement.denomination_usuelle ||
      nom_prenom;

    return {
      siret: etablissement.siret,
      nom_raison_sociale: etablissement.unite_legale.denomination,
      tranche_effectifs: etablissement.tranche_effectifs,
      etat_administratif: etablissement.etat_administratif,
      organization_label,
      statut_diffusion: etablissement.statut_diffusion,
    };
  } catch (e) {
    if ([403, 404].includes(e.response && e.response.status)) {
      return {};
    }
    throw e;
  }
};
