type ApiAnnuaireServicePublicReponse = {
  total_count: number;
  results: {
    site_internet: {
      valeur: string;
    }[];
    nom: string;
    adresse_courriel?: string;
    pivot: {
      type_service_local: string;
    }[];
    id: string;
    telephone: {
      valeur: string;
    }[];
    code_insee_commune: string;
    adresse: {
      type_adresse: "Adresse";
      numero_voie: string;
      code_postal: string;
      nom_commune: string;
      longitude: string;
      latitude: string;
    }[];
  }[];
};
