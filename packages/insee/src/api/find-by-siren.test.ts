//

import { expect } from "chai";
import { describe, it } from "mocha";
import nock from "nock";
import { findBySirenFactory } from "./find-by-siren.js";

//

const findBySiren = findBySirenFactory({
  getInseeAccessToken: async () => "SECRET_INSEE_TOKEN",
});

describe("findBySiren", () => {
  it("should return an establishment", async () => {
    nock("https://api.insee.fr")
      .get(
        "/entreprises/sirene/siret?q=siren:200071843 AND etablissementSiege:true",
      )
      .reply(200, { etablissements: [{ siren: "🦄" }] });

    const establishment = await findBySiren("200071843");
    expect(establishment).to.be.deep.equal({ siren: "🦄" });
  });
});
