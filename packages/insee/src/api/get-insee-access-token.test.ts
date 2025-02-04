//

import { inseeMockServer } from "#mocks";
import { expect } from "chai";
import { before, describe, it } from "mocha";
import { getInseeAccessTokenFactory } from "./get-insee-access-token.js";

//

const getInseeAccessToken = getInseeAccessTokenFactory({
  consumerKey: process.env.INSEE_CONSUMER_KEY ?? "",
  consumerSecret: process.env.INSEE_CONSUMER_SECRET ?? "",
});

describe("getInseeAccessToken", function () {
  before(function () {
    if (process.env.UPDATE_SNAPSHOT) {
      this.skip();
    }
  });

  before(() => inseeMockServer.listen());
  afterEach(() => inseeMockServer.resetHandlers());
  after(() => inseeMockServer.close());

  it("should return ACCESS_TOKEN access token", async () => {
    const access_token = await getInseeAccessToken();
    expect(access_token).to.be.equal("__INSEE_API_ACCESS_TOKEN__");
  });
});
