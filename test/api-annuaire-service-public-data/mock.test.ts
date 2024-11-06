//

import { assert } from "chai";
import { writeFile } from "fs/promises";
import { join } from "path";
import { format } from "prettier";

describe("https://api-lannuaire.service-public.fr", () => {
  if (!process.env["UPDATE_MOCKS"]) {
    // NOTE(douglasduteil): This test is disabled by default.
    // To enable it, you need to set the `UPDATE_MOCKS` environment variable to `true`.
    return;
  }

  it("one-mairie.json", async () => {
    const input = new URL(
      "/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records",
      "https://api-lannuaire.service-public.fr",
    );
    input.searchParams.append(
      "where",
      'code_insee_commune LIKE "15014" and pivot LIKE "mairie"',
    );
    const response = await fetch(input, {
      headers: {
        accept: "application/json",
      },
    });

    assert.isTrue(response.ok);

    await writeFile(
      join(import.meta.dirname, "/one-mairie.json"),
      await format(await response.text(), { parser: "json" }),
    );
  });

  it("two-mairies.json", async () => {
    const input = new URL(
      "/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records",
      "https://api-lannuaire.service-public.fr",
    );
    input.searchParams.append(
      "where",
      'code_insee_commune LIKE "38253" and pivot LIKE "mairie"',
    );

    const response = await fetch(input, {
      headers: {
        accept: "application/json",
      },
    });

    assert.isTrue(response.ok);

    await writeFile(
      join(import.meta.dirname, "/two-mairies.json"),
      await format(await response.text(), { parser: "json" }),
    );
  });
});
