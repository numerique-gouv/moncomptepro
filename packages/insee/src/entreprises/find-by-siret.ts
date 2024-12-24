//

import type { GetInseeAccessTokenHandler } from "#src/token";
import type { EtablissementSearchBySiretResponse } from "#src/types";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";

//

type FactoryDependencies = {
  getAccessToken: GetInseeAccessTokenHandler;
  config?: AxiosRequestConfig;
};

export function findBySiretFactory({
  getAccessToken,
  config,
}: FactoryDependencies) {
  return async function findBySiret(siret: string) {
    const token = await getAccessToken();
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
