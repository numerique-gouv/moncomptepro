//

import { fetch_crisp } from "#src/client/fetcher.js";
import { defineConfig } from "#test/config";
import { expect } from "#test/expect";
import { test } from "mocha";

//

test("find douglas.duteil@beta.gouv.fr", async () => {
  const config = defineConfig();
  const operators = await fetch_crisp(config, {
    endpoint: `/v1/website/${config.website_id}/operators/list`,
    method: "GET",
    searchParams: {},
  });

  const operator = operators.find(
    ({ details }) => details.email === "moncomptepro@beta.gouv.fr",
  )!;

  expect(operator).toEqual({
    details: {
      email: "moncomptepro@beta.gouv.fr",
      first_name: "Raphaël",
      last_name: "Dubigny",
      user_id: "1000e693-514d-43fe-8eaa-f4fed891f1e0",
    },
    type: "sandbox",
  });
});
