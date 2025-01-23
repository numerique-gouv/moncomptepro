//

import { http, HttpResponse } from "msw";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

//

const snapshot_dir = join(import.meta.dirname, "__snapshots__");

export const get_operators = http.post(
  "https://api.crisp.chat/v1/website/:website_id/operators/list",
  async () => {
    const data = await readFile(join(snapshot_dir, `operators.json`), "utf8");
    return HttpResponse.text(data);
  },
);
