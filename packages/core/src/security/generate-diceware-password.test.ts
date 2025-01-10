//

import { assert } from "chai";
import { describe, it } from "mocha";
import { GenerarateDicewarePassword } from "./generate-diceware-password.js";

//

describe("GenerarateDicewarePassword", () => {
  it("should generate two words", () => {
    const generatePassword = GenerarateDicewarePassword([
      () => "11111",
      () => "22222",
    ]);
    assert.equal(generatePassword(), "abandon-cible");
  });

  it("should generate three words", () => {
    const generatePassword = GenerarateDicewarePassword([
      () => "11111",
      () => "22222",
      () => "33333",
    ]);
    assert.equal(generatePassword(), "abandon-cible-gastrique");
  });
});
