import type { CategoriesJuridique, CodeNaf, CodeVoie } from "#src/data";
import type { TrancheEffectifs } from "./tranche-effectifs.js";
export type InseeEtablissement = {
  // ex: '217400563'
  siren: string;
  // ex: '00011'
  nic: string;
  // ex: '21740056300011'
  siret: string;
  // ex: 'O'
  statutDiffusionEtablissement: "O" | "P" | "N";
  // ex: '1983-03-01'
  dateCreationEtablissement: string;
  // ex: '32'
  trancheEffectifsEtablissement: TrancheEffectifs;
  // ex: '2020'
  anneeEffectifsEtablissement: string;
  activitePrincipaleRegistreMetiersEtablissement: string | null;
  // ex: '2022-08-29T09:08:45'
  dateDernierTraitementEtablissement: string;
  // ex: true
  etablissementSiege: boolean;
  // ex: 4
  nombrePeriodesEtablissement: number;
  uniteLegale: {
    // ex: 'A'
    etatAdministratifUniteLegale: string;
    // ex: 'O'
    statutDiffusionUniteLegale: "O" | "P" | "N";
    // ex: '1982-01-01'
    dateCreationUniteLegale: string;
    // ex: '7210'
    categorieJuridiqueUniteLegale: CategoriesJuridique;
    // ex: 'COMMUNE DE CHAMONIX MONT BLANC'
    denominationUniteLegale: string;
    sigleUniteLegale: string | null;
    denominationUsuelle1UniteLegale: string | null;
    denominationUsuelle2UniteLegale: string | null;
    denominationUsuelle3UniteLegale: string | null;
    sexeUniteLegale: string | null;
    nomUniteLegale: string | null;
    nomUsageUniteLegale: string | null;
    prenom1UniteLegale: string | null;
    prenom2UniteLegale: string | null;
    prenom3UniteLegale: string | null;
    prenom4UniteLegale: string | null;
    prenomUsuelUniteLegale: string | null;
    pseudonymeUniteLegale: string | null;
    // ex: '84.11Z'
    activitePrincipaleUniteLegale: string;
    nomenclatureActivitePrincipaleUniteLegale: "NAFRev2";
    identifiantAssociationUniteLegale: string | null;
    // ex: 'N'
    economieSocialeSolidaireUniteLegale: string;
    // ex: 'N'
    societeMissionUniteLegale: string;
    // ex: 'O'
    caractereEmployeurUniteLegale: string;
    // ex: '32'
    trancheEffectifsUniteLegale: TrancheEffectifs;
    // ex: '2020'
    anneeEffectifsUniteLegale: string;
    // ex: '00011'
    nicSiegeUniteLegale: string;
    // ex: '2023-03-01T20:13:11'
    dateDernierTraitementUniteLegale: string;
    // ex: 'ETI'
    categorieEntreprise: string;
    // ex: '2020'
    anneeCategorieEntreprise: string;
  };
  adresseEtablissement: {
    complementAdresseEtablissement: string | null;
    // ex: '38'
    numeroVoieEtablissement: string;
    indiceRepetitionEtablissement: string | null;
    // ex: 'PL'
    typeVoieEtablissement: CodeVoie;
    // ex: 'DE L EGLISE'
    libelleVoieEtablissement: string;
    // ex: '74400'
    codePostalEtablissement: string;
    // ex: 'CHAMONIX-MONT-BLANC'
    libelleCommuneEtablissement: string;
    libelleCommuneEtrangerEtablissement: string | null;
    distributionSpecialeEtablissement: string | null;
    // ex: '74056'
    codeCommuneEtablissement: string;
    codeCedexEtablissement: string | null;
    libelleCedexEtablissement: string | null;
    codePaysEtrangerEtablissement: string | null;
    libellePaysEtrangerEtablissement: string | null;
  };
  adresse2Etablissement: {
    complementAdresse2Etablissement: null;
    numeroVoie2Etablissement: null;
    indiceRepetition2Etablissement: null;
    typeVoie2Etablissement: null;
    libelleVoie2Etablissement: null;
    codePostal2Etablissement: null;
    libelleCommune2Etablissement: null;
    libelleCommuneEtranger2Etablissement: null;
    distributionSpeciale2Etablissement: null;
    codeCommune2Etablissement: null;
    codeCedex2Etablissement: null;
    libelleCedex2Etablissement: null;
    codePaysEtranger2Etablissement: null;
    libellePaysEtranger2Etablissement: null;
  };
  periodesEtablissement: {
    dateFin: string | null;
    // ex: '2008-01-01'
    dateDebut: string;
    // ex: 'A'
    etatAdministratifEtablissement: string;
    // ex: false
    changementEtatAdministratifEtablissement: boolean;
    // ex: 'MAIRIE CHAMONIX - ARGENTIERE'
    enseigne1Etablissement: string;
    enseigne2Etablissement: null;
    enseigne3Etablissement: null;
    // ex: false
    changementEnseigneEtablissement: boolean;
    denominationUsuelleEtablissement: null;
    // ex: false
    changementDenominationUsuelleEtablissement: boolean;
    // ex: '84.11Z'
    activitePrincipaleEtablissement: CodeNaf;
    nomenclatureActivitePrincipaleEtablissement: "NAFRev2";
    // ex: true
    changementActivitePrincipaleEtablissement: boolean;
    // ex: 'O'
    caractereEmployeurEtablissement: string;
    // ex: false
    changementCaractereEmployeurEtablissement: boolean;
  }[];
};
