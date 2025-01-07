//

import { expect } from "chai";
import { describe, it } from "mocha";
import nock from "nock";
import { findBySiretFactory } from "./find-by-siret.js";

//

const findBySiret = findBySiretFactory({
  getInseeAccessToken: async () => "SECRET_INSEE_TOKEN",
});

describe("findBySiret", () => {
  it("should return an establishment", async () => {
    nock("https://api.insee.fr")
      .get("/entreprises/sirene/siret/20007184300060")
      .reply(200, { etablissement: { siren: "🦄" } });

    const establishment = await findBySiret("20007184300060");
    expect(establishment).to.be.deep.equal({ siren: "🦄" });
  });
});
