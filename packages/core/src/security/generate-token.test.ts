//

import { assert } from "chai";
import { generateToken } from "./generate-token.js";

//

describe("generateToken", () => {
  it("should be 64 characters long", () => {
    const token = generateToken();
    assert.lengthOf(token, 64);
  });
});
