//

import { getInseeAccessTokenFactory } from "#src/api";
import { assert } from "chai";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";

//

const sirets = [
  "13002526500013",
  "19750663700010",
  "20006443400018",
  "20007184300060",
  "21340126800049",
  "21340126800130",
  "21740056300011",
  "21920023500014",
  "21920023500394",
  "45334017600024",
  "54205118000066",
  "66204244905476",
  "66204244914742",
  "66204244933106",
  "81801912700021",
];

const sirens = ["200071843"];

const snapshot_dir = join(import.meta.dirname, "__snapshots__");
const { UPDATE_SNAPSHOT, INSEE_CONSUMER_KEY, INSEE_CONSUMER_SECRET } =
  process.env;

//

describe("🌱 /entreprises/sirene/siret/[siret]", function () {
  before(async function (this: Mocha.Context) {
    if (!UPDATE_SNAPSHOT) return this.skip();
    await mkdir(snapshot_dir, { recursive: true });
  });

  afterEach(async function (this: Mocha.Context) {
    await new Promise((resolve) => setTimeout(resolve, 1_000 / 12));
  });

  const getInseeAccessToken = getInseeAccessTokenFactory({
    consumerKey: INSEE_CONSUMER_KEY ?? "",
    consumerSecret: INSEE_CONSUMER_SECRET ?? "",
  });

  sirets.forEach((siret) => {
    it(`fetching info for siret = ${siret}`, async function () {
      const input = new URL(
        `/entreprises/sirene/siret/${siret}`,
        "https://api.insee.fr",
      );
      const token = await getInseeAccessToken();
      const response = await fetch(input, {
        headers: { Authorization: `Bearer ${token}` },
      });

      assert.isTrue(response.ok);

      await writeFile(
        join(snapshot_dir, `${siret}.json`),
        await format(await response.text(), { parser: "json" }),
      );
    });
  });
});

describe("🌱 /entreprises/sirene/siret?siren:[siren]", function () {
  before(async function (this: Mocha.Context) {
    if (!UPDATE_SNAPSHOT) return this.skip();
    await mkdir(snapshot_dir, { recursive: true });
  });

  const getInseeAccessToken = getInseeAccessTokenFactory({
    consumerKey: INSEE_CONSUMER_KEY ?? "",
    consumerSecret: INSEE_CONSUMER_SECRET ?? "",
  });

  sirens.forEach((siren) => {
    it(`fetching info for siren = ${siren}`, async function () {
      const input = new URL(
        `/entreprises/sirene/siret?q=siren:${siren} AND etablissementSiege:true`,
        "https://api.insee.fr",
      );
      const token = await getInseeAccessToken();
      const response = await fetch(input, {
        headers: { Authorization: `Bearer ${token}` },
      });

      assert.isTrue(response.ok);

      await writeFile(
        join(snapshot_dir, `siren:${siren}.json`),
        await format(await response.text(), { parser: "json" }),
      );
    });
  });
});
