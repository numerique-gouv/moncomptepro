/**
 * This fonction return approximate results. As the data tranche effectifs is
 * two years old. Consequently, an organization that growths quickly within the
 * first two years of his existence can be miss-identified as unipersonnelle by
 * this fonction.
 */
export const isEntrepriseUnipersonnelle = ({
  cached_categorie_juridique,
  cached_tranche_effectifs,
}: Organization): boolean => {
  // check that the organization has the right catégorie juridique
  const cat_jur_ok = [
    'Entrepreneur individuel',
    'Société à responsabilité limitée (sans autre indication)',
    'SAS, société par actions simplifiée',
  ].includes(cached_categorie_juridique || '');

  // check that the organization has the right tranche effectifs
  const tra_eff_ok = ['NN', '00', null].includes(cached_tranche_effectifs);

  return cat_jur_ok && tra_eff_ok;
};
