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
  const tra_eff_ok = ['NN', '00', null].includes(cached_tranche_effectifs);

  return cat_jur_ok && tra_eff_ok;
};

export const isCollectiviteTerritoriale = ({
  cached_libelle_categorie_juridique,
}: Organization): boolean => {
  return [
    'Commune et commune nouvelle',
    'Communauté de communes',
    'Commune associée et commune déléguée',
  ].includes(cached_libelle_categorie_juridique || '');
};

// inspired from https://github.com/etalab/annuaire-entreprises-search-infra/blob/c86bdb34ff6359de3a740ae2f1fa49133ddea362/data_enrichment.py#L104
export const isServicePublic = ({
  cached_categorie_juridique,
  siret,
}: Organization): boolean => {
  const cat_jur_ok = ['3210', '3110', '4', '71', '72', '73', '74'].some(e =>
    cached_categorie_juridique?.startsWith(e)
  );

  const siret_ok = ['1', '2'].some(e => siret?.startsWith(e));

  return cat_jur_ok || siret_ok;
};
