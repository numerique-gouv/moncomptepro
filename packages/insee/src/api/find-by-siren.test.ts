//

import { inseeMockServer } from "#mocks";
import { expect } from "chai";
import { describe, it } from "mocha";
import { findBySirenFactory } from "./find-by-siren.js";

//

const findBySiren = findBySirenFactory({
  getInseeAccessToken: async () => "SECRET_INSEE_TOKEN",
});

describe("findBySiren", () => {
  before(() => inseeMockServer.listen());
  afterEach(() => inseeMockServer.resetHandlers());
  after(() => inseeMockServer.close());

  it("should return an establishment", async () => {
    const establishment = await findBySiren("200071843");
    expect(establishment).to.be.deep.include({
      siren: "200071843",
      siret: "20007184300060",
    });
  });
});
