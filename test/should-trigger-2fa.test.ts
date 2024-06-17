import { assert } from "chai";
import { shouldTrigger2fa } from "../src/services/should-trigger-2fa";

describe("shouldTrigger2fa", () => {
  it("should return false for random prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    assert.equal(shouldTrigger2fa(prompt), false);
  });

  it("should return true for new session", () => {
    const prompt = {
      name: "login",
      reasons: ["no_session", "essential_acr"],
      details: {
        acr: { essential: true, value: "https://refeds.org/profile/mfa" },
      },
    };

    assert.equal(shouldTrigger2fa(prompt), true);
  });

  it("should return true for existing session", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: ["eidas2", "https://refeds.org/profile/mfa"],
        },
      },
    };

    assert.equal(shouldTrigger2fa(prompt), true);
  });
});
