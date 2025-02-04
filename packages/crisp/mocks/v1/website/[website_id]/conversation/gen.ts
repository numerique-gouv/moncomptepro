//

import { fetch_crisp } from "#src/client/fetcher";
import { defineConfig } from "#test/config";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";

//

const snapshot_dir = join(import.meta.dirname, "__snapshots__");

//

describe("🌱 /v1/website/[website_id]/conversation", function () {
  const config = defineConfig();

  before(async function (this: Mocha.Context) {
    if (!process.env.UPDATE_SNAPSHOT) return this.skip();
    await mkdir(snapshot_dir, { recursive: true });
  });

  it("POST /v1/website/[website_id]/conversation", async function () {
    const body = await fetch_crisp(config, {
      endpoint: `/v1/website/${config.website_id}/conversation`,
      method: "POST",
      searchParams: {},
    });

    const conversation = {
      ...body,
      session_id: body.session_id.slice(-7),
    };

    await writeFile(
      join(snapshot_dir, `conversation.json`),
      await format(JSON.stringify(conversation), { parser: "json" }),
    );
  });
});
