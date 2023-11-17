import { isDomainValid } from './security';

/**
 * This fonction return approximate results. As the data tranche effectifs is
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
    'Entrepreneur individuel',
    'Société à responsabilité limitée (sans autre indication)',
    'SAS, société par actions simplifiée',
  ].includes(cached_libelle_categorie_juridique || '');

  // check that the organization has the right tranche effectifs
  const tra_eff_ok = [null, 'NN', '00', '01'].includes(
    cached_tranche_effectifs
  );

  return cat_jur_ok && tra_eff_ok;
};

export const isCommune = (
  { cached_libelle_categorie_juridique }: Organization,
  considerCommunauteDeCommunesAsCommune = false
): boolean => {
  let cat_jur = [
    'Commune et commune nouvelle',
    'Commune associée et commune déléguée',
  ];

  if (considerCommunauteDeCommunesAsCommune) {
    cat_jur.push('Communauté de communes');
  }

  return cat_jur.includes(cached_libelle_categorie_juridique || '');
};

// inspired from https://github.com/etalab/annuaire-entreprises-search-infra/blob/c86bdb34ff6359de3a740ae2f1fa49133ddea362/data_enrichment.py#L104
export const isServicePublic = ({
  cached_categorie_juridique,
  siret,
}: Organization): boolean => {
  const cat_jur_ok = ['3210', '3110', '4', '71', '72', '73', '74'].some(
    (e) => cached_categorie_juridique?.startsWith(e)
  );

  const siret_ok = ['1', '2'].some((e) => siret?.startsWith(e));

  return cat_jur_ok || siret_ok;
};

export const hasLessThanFiftyEmployees = ({
  cached_tranche_effectifs,
}: Organization): boolean => {
  return [null, 'NN', '00', '01', '02', '03', '11', '12'].includes(
    cached_tranche_effectifs
  );
};

export const isEtablissementScolaireDuPremierEtSecondDegre = ({
  cached_libelle_activite_principale,
  cached_libelle_categorie_juridique,
}: Organization) => {
  const isCollegeOuLyceePublic =
    (cached_libelle_activite_principale ===
      '85.31Z - Enseignement secondaire général' ||
      cached_libelle_activite_principale ===
        '85.32Z - Enseignement secondaire technique ou professionnel') &&
    cached_libelle_categorie_juridique ===
      "Établissement public local d'enseignement";

  const isCollegeOuLyceePrive =
    (cached_libelle_activite_principale ===
      '85.31Z - Enseignement secondaire général' ||
      cached_libelle_activite_principale ===
        '85.32Z - Enseignement secondaire technique ou professionnel') &&
    cached_libelle_categorie_juridique === 'Association déclarée';

  const isEcolePrimairePublique =
    cached_libelle_activite_principale === '85.20Z - Enseignement primaire' &&
    cached_libelle_categorie_juridique === 'Commune et commune nouvelle';

  const isEcolePrimairePrivee =
    cached_libelle_activite_principale === '85.20Z - Enseignement primaire' &&
    cached_libelle_categorie_juridique === 'Association déclarée';

  const isEcoleMaternellePublique =
    cached_libelle_activite_principale ===
      '85.10Z - Enseignement pré-primaire' &&
    cached_libelle_categorie_juridique === 'Commune et commune nouvelle';

  return (
    isCollegeOuLyceePublic ||
    isCollegeOuLyceePrive ||
    isEcolePrimairePublique ||
    isEcolePrimairePrivee ||
    isEcoleMaternellePublique
  );
};

export const isEducationNationaleDomain = (domain: string) => {
  if (!isDomainValid(domain)) {
    return false;
  }

  return domain.match(/^ac-[a-zA-Z0-9-]*\.fr$/) !== null;
};
