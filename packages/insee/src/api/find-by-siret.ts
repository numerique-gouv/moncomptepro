//

import type { GetInseeAccessTokenHandler } from "#src/api";
import type { InseeEtablissement } from "#src/types";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";

//

type FactoryDependencies = {
  getInseeAccessToken: GetInseeAccessTokenHandler;
  config?: AxiosRequestConfig;
};
type EtablissementSearchBySiretResponse = {
  etablissement: InseeEtablissement;
};

export function findBySiretFactory({
  getInseeAccessToken,
  config,
}: FactoryDependencies) {
  return async function findBySiret(siret: string) {
    const token = await getInseeAccessToken();
    const { data }: AxiosResponse<EtablissementSearchBySiretResponse> =
      await axios.get(
        `https://api.insee.fr/entreprises/sirene/siret/${siret}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          ...config,
        },
      );

    return data.etablissement;
  };
}

export type FindBySiretHandler = ReturnType<typeof findBySiretFactory>;
