//

import { assert } from "chai";
import { describe, it } from "mocha";
import { generatePinToken } from "./generate-pin-token.js";

//

describe("generatePinToken", () => {
  it("should use digits only", () => {
    const token = generatePinToken();
    assert.match(token, /^[0-9]{10}$/);
  });

  it("should be 10 characters long", () => {
    const token = generatePinToken();
    assert.lengthOf(token, 10);
  });
});
