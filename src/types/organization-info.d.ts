// source : https://www.sirene.fr/sirene/public/variable/trancheEffectifsEtablissement
type TrancheEffectifs =
  // le champ peut être null bien que la documentation ne spécifie pas à quoi correspond ce cas
  | null
  // Etablissement non employeur (pas de salarié au cours de l'année de référence et pas d'effectif au 31/12)NN
  | 'NN'
  // 0 salarié (n'ayant pas d'effectif au 31/12 mais ayant employé des salariés au cours de l'année de référence)''
  | '00'
  // 1 ou 2 salariés
  | '01'
  // 3 à 5 salariés
  | '02'
  // 6 à 9 salariés
  | '03'
  // 10 à 19 salariés
  | '11'
  // 20 à 49 salariés
  | '12'
  // 50 à 99 salariés
  | '21'
  // 100 à 199 salariés
  | '22'
  // 200 à 249 salariés
  | '31'
  // 250 à 499 salariés
  | '32'
  // 500 à 999 salariés
  | '41'
  // 1 000 à 1 999 salariés
  | '42'
  // 2 000 à 4 999 salariés
  | '51'
  // 5 000 à 9 999 salariés
  | '52'
  // 10 000 salariés et plus
  | '53';

interface OrganizationInfo {
  siret: string;
  libelle: string;
  nomComplet: string;
  enseigne: string;
  trancheEffectifs: string;
  trancheEffectifsUniteLegale: string;
  libelleTrancheEffectif: TrancheEffectifs;
  etatAdministratif: string;
  estActive: boolean;
  statutDiffusion: string;
  estDiffusible: boolean;
  adresse: string;
  codePostal: string;
  activitePrincipale: string;
  libelleActivitePrincipale: string;
  categorieJuridique: string;
  libelleCategorieJuridique: string;
}
