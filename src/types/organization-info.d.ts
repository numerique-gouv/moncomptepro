// source : https://www.sirene.fr/sirene/public/variable/trancheEffectifsEtablissement

import { TrancheEffectifs } from "@gouvfr-lasuite/proconnect.insee/types";

interface OrganizationInfo {
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
