//

import type { TrancheEffectifs } from "./tranche-effectifs.js";

//

export interface OrganizationInfo {
  siret: string;
  libelle: string;
  nomComplet: string;
  enseigne: string;
  trancheEffectifs: TrancheEffectifs;
  trancheEffectifsUniteLegale: TrancheEffectifs;
  libelleTrancheEffectif: string;
  etatAdministratif: string;
  estActive: boolean;
  statutDiffusion: string;
  estDiffusible: boolean;
  adresse: string;
  codePostal: string;
  codeOfficielGeographique: string;
  activitePrincipale: string;
  libelleActivitePrincipale: string;
  categorieJuridique: string;
  libelleCategorieJuridique: string;
}
