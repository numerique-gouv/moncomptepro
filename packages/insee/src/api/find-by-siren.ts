//

import type { GetInseeAccessTokenHandler } from "#src/api";
import { InvalidSirenError } from "#src/errors";
import type { InseeEtablissement } from "#src/types";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

//

type FactoryDependencies = {
  getInseeAccessToken: GetInseeAccessTokenHandler;
  config?: AxiosRequestConfig;
};

type EtablissementSearchResponse = {
  header: {
    total: number;
    debut: number;
    nombre: number;
  };
  etablissements: InseeEtablissement[];
};

export function findBySirenFactory({
  getInseeAccessToken,
  config,
}: FactoryDependencies) {
  return async function findBySiren(siren: string) {
    const token = await getInseeAccessToken();
    const { data }: AxiosResponse<EtablissementSearchResponse> =
      await axios.get(
        `https://api.insee.fr/entreprises/sirene/siret?q=siren:${siren} AND etablissementSiege:true`,
        {
          headers: { Authorization: `Bearer ${token}` },
          ...config,
        },
      );

    const establishment = data.etablissements.at(0);

    if (!establishment) {
      throw new InvalidSirenError();
    }

    return establishment;
  };
}

export type FindBySirenHandler = ReturnType<typeof findBySirenFactory>;
