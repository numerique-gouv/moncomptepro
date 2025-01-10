//

import { expect } from "chai";
import { describe, it } from "mocha";
import nock from "nock";
import { getInseeAccessTokenFactory } from "./get-insee-access-token.js";

//

const getInseeAccessToken = getInseeAccessTokenFactory({
  consumerKey: "🔑",
  consumerSecret: "㊙️",
});

describe("getInseeAccessToken", () => {
  it("should return 🛂 access token", async () => {
    nock("https://api.insee.fr").post("/token").reply(200, {
      access_token: "🛂",
      scope: "am_application_scope default",
      token_type: "Bearer",
      expires_in: 123456,
    });
    const access_token = await getInseeAccessToken();
    expect(access_token).to.be.equal("🛂");
  });
});
