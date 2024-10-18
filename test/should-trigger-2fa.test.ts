import { assert } from "chai";
import {
  isAcrSatisfied,
  isThereAnyRequestedAcr,
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
            "urn:dinum:ac:classes:self-asserted-2fa",
            "urn:dinum:ac:classes:consistency-checked-2fa",
          ],
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), true);
  });

  it("should return false if non 2fa acr are requested", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: [
            "urn:dinum:ac:classes:consistency-checked",
            "urn:dinum:ac:classes:consistency-checked-2fa",
          ],
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), false);
  });

  it("should return false for unknown acr", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          value: "eidas2",
        },
      },
    };

    assert.equal(twoFactorsAuthRequested(prompt), false);
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

describe("isThereAnyRequestedAcr", () => {
  it("should return false for acr non-related prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    assert.equal(isThereAnyRequestedAcr(prompt), false);
  });

  it("should return true for prompt with no acr required", () => {
    const prompt = { name: "login", reasons: ["no_session"], details: {} };

    assert.equal(isThereAnyRequestedAcr(prompt), false);
  });

  it("should return false for legacy acr", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          value: "eidas1",
        },
      },
    };

    assert.equal(isThereAnyRequestedAcr(prompt), false);
  });

  it("should return true for non legacy acr", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: ["eidas1", "urn:dinum:ac:classes:consistency-checked-2fa"],
        },
      },
    };

    assert.equal(isThereAnyRequestedAcr(prompt), true);
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

    assert.equal(isThereAnyRequestedAcr(prompt), true);
  });
});
