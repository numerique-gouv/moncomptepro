//

import { fetch_crisp } from "#src/client/fetcher";
import { defineConfig } from "#test/config";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";

//

const snapshot_dir = join(import.meta.dirname, "__snapshots__");

//

const hash7 = (value: string | undefined) =>
  value
    ? createHash("sha256").update(value).digest("hex").slice(-7)
    : undefined;

describe("🌱 /v1/website/[website_id]/operators/list", function () {
  const config = defineConfig();

  before(async function (this: Mocha.Context) {
    if (!process.env.UPDATE_SNAPSHOT) return this.skip();
    await mkdir(snapshot_dir, { recursive: true });
  });

  it("GET /v1/website/[website_id]/operators/list", async function () {
    const body = await fetch_crisp(config, {
      endpoint: `/v1/website/${config.website_id}/operators/list`,
      method: "GET",
      searchParams: {},
    });

    const operators = body.map(function (operator) {
      const { email, last_name, user_id } = operator.details;
      const [username, domain] = email.split("@");

      return {
        ...operator,
        details: {
          ...operator.details,
          avatar: `https://picsum.photos/seed/${hash7(username)}/200/300`,
          email: hash7(username) + "@" + domain,
          last_name: hash7(last_name),
          user_id: hash7(user_id),
        },
      };
    });

    await writeFile(
      join(snapshot_dir, `operators.json`),
      await format(JSON.stringify(operators), { parser: "json" }),
    );
  });
});
