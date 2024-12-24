//

import { InvalidSirenError } from "#src/errors";
import type { GetInseeAccessTokenHandler } from "#src/token";
import type { EtablissementSearchResponse } from "#src/types";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

//

type FactoryDependencies = {
  getAccessToken: GetInseeAccessTokenHandler;
  config?: AxiosRequestConfig;
};

export function findBySirenFactory({
  getAccessToken,
  config,
}: FactoryDependencies) {
  return async function findBySiren(siren: string) {
    const token = await getAccessToken();
    const { data }: AxiosResponse<EtablissementSearchResponse> =
      await axios.get(
        `https://api.insee.fr/entreprises/sirene/siret?q=siren:${siren} AND etablissementSiege:true`,
        {
          headers: { Authorization: `Bearer ${token}` },
          ...config,
        },
      );

    const etablissement = data.etablissements.at(0);

    if (!etablissement) {
      throw new InvalidSirenError();
    }

    return etablissement;
  };
}

export type FindBySirenHandler = ReturnType<typeof findBySirenFactory>;
