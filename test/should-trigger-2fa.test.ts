import { assert } from "chai";
import {
  isAcrSatisfied,
  isThereAnyRequestedAcrOtherThanEidas1,
  twoFactorsAuthRequested,
} from "../src/services/should-trigger-2fa";

// TODO rename this file
describe("twoFactorsAuthRequested", () => {
  it("should return false for random prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    assert.equal(twoFactorsAuthRequested(prompt), false);
  });

  it("should return false for prompt with no acr required", () => {
    const prompt = { name: "login", reasons: ["no_session"], details: {} };

    assert.equal(twoFactorsAuthRequested(prompt), false);
  });

  it("should return true for new session", () => {
    const prompt = {
      name: "login",
      reasons: ["no_session", "essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "urn:dinum:ac:classes:consistency-checked-2fa",
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), true);
  });

  it("should return true for self asserted identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "urn:dinum:ac:classes:self-asserted-2fa",
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), true);
  });

  it("should return true for existing session", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: [
            "eidas2",
            "urn:dinum:ac:classes:self-asserted-2fa",
            "urn:dinum:ac:classes:consistency-checked-2fa",
          ],
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), true);
  });
});

describe("isAcrSatisfied", () => {
  it("should return true for acr non-related prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    assert.equal(
      isAcrSatisfied(prompt, "urn:dinum:ac:classes:self-asserted"),
      true,
    );
  });

  it("should return true for prompt with no acr required", () => {
    const prompt = { name: "login", reasons: ["no_session"], details: {} };

    assert.equal(
      isAcrSatisfied(prompt, "urn:dinum:ac:classes:self-asserted"),
      true,
    );
  });

  it("should return true for consistency checked identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "urn:dinum:ac:classes:consistency-checked",
        },
      },
    };

    assert.equal(
      isAcrSatisfied(prompt, "urn:dinum:ac:classes:consistency-checked"),
      true,
    );
  });
  it("should return false for self-asserted identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "urn:dinum:ac:classes:consistency-checked",
        },
      },
    };

    assert.equal(
      isAcrSatisfied(prompt, "urn:dinum:ac:classes:self-asserted"),
      false,
    );
  });
});

describe("isThereAnyRequestedAcrOtherThanEidas1", () => {
  it("should return false for acr non-related prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    assert.equal(isThereAnyRequestedAcrOtherThanEidas1(prompt), false);
  });

  it("should return true for prompt with no acr required", () => {
    const prompt = { name: "login", reasons: ["no_session"], details: {} };

    assert.equal(isThereAnyRequestedAcrOtherThanEidas1(prompt), false);
  });

  it("should return true for mfa requested identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: [
            "urn:dinum:ac:classes:self-asserted-2fa",
            "urn:dinum:ac:classes:consistency-checked-2fa",
          ],
        },
      },
    };

    assert.equal(isThereAnyRequestedAcrOtherThanEidas1(prompt), true);
  });
});
