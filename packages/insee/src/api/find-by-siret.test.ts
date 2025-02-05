//

import { inseeMockServer } from "#mocks";
import { expect } from "chai";
import { describe, it } from "mocha";
import { findBySiretFactory } from "./find-by-siret.js";
import { getInseeAccessTokenFactory } from "./get-insee-access-token.js";

//

const findBySiret = findBySiretFactory({
  getInseeAccessToken: getInseeAccessTokenFactory({
    consumerKey: process.env.INSEE_CONSUMER_KEY ?? "",
    consumerSecret: process.env.INSEE_CONSUMER_SECRET ?? "",
  }),
});

describe("findBySiret", () => {
  before(() => inseeMockServer.listen());
  afterEach(() => inseeMockServer.resetHandlers());
  after(() => inseeMockServer.close());

  it("should return an establishment", async () => {
    const establishment = await findBySiret("20007184300060");

    expect(establishment).to.be.deep.include({
      siren: "200071843",
      siret: "20007184300060",
    });
  });
});
