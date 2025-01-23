//

import { http, HttpResponse } from "msw";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

//

const snapshot_dir = join(import.meta.dirname, "__snapshots__");

export const get_organization_by_siret = http.get(
  "https://api.insee.fr/entreprises/sirene/siret/:siret",
  async ({ params }) => {
    const siret = String(params["siret"]);
    const data = await readFile(join(snapshot_dir, `${siret}.json`), "utf8");
    return HttpResponse.text(data);
  },
);

export const find_organization_by_siret = http.get(
  "https://api.insee.fr/entreprises/sirene/siret",
  async ({ request }) => {
    const { searchParams } = new URL(request.url);

    // /entreprises/sirene/siret?q={query}
    // ex: /entreprises/sirene/siret?q=siren:200071843
    const q = searchParams.get("q");
    if (!q) {
      return HttpResponse.json("q is required in search params", {
        status: 422,
      });
    }

    // for siren:200071843
    const { siren } = q.match(/siren:(?<siren>\d+)/)?.groups ?? {};
    if (!siren) {
      return HttpResponse.json("siren:[siren] is required in search params", {
        status: 422,
      });
    }

    const data = await readFile(
      join(snapshot_dir, `siren:${siren}.json`),
      "utf8",
    );
    return HttpResponse.text(data);
  },
);
