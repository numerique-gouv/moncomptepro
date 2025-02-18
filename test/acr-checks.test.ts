import { describe, expect, it } from "vitest";
import {
  certificationDirigeantRequested,
  isAcrSatisfied,
  isThereAnyRequestedAcr,
  twoFactorsAuthRequested,
} from "../src/services/acr-checks";

describe("twoFactorsAuthRequested", () => {
  it("should return false for random prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    expect(twoFactorsAuthRequested(prompt)).toBeFalsy();
  });

  it("should return false for prompt with no acr required", () => {
    const prompt = { name: "login", reasons: ["no_session"], details: {} };

    expect(twoFactorsAuthRequested(prompt)).toBeFalsy();
  });

  it("should return true for new session", () => {
    const prompt = {
      name: "login",
      reasons: ["no_session", "essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
        },
      },
    };

    expect(twoFactorsAuthRequested(prompt)).toBeTruthy();
  });

  it("should return true for self asserted identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
        },
      },
    };

    expect(twoFactorsAuthRequested(prompt)).toBeTruthy();
  });

  it("should return true for existing session", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: [
            "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
            "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
          ],
        },
      },
    };

    expect(twoFactorsAuthRequested(prompt)).toBeTruthy();
  });

  it("should return false if non 2fa acr are requested", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: [
            "https://proconnect.gouv.fr/assurance/consistency-checked",
            "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
          ],
        },
      },
    };

    expect(twoFactorsAuthRequested(prompt)).toBeFalsy();
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

    expect(twoFactorsAuthRequested(prompt)).toBeFalsy();
  });
});

describe("isAcrSatisfied", () => {
  it("should return true for acr non-related prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    expect(
      isAcrSatisfied(
        prompt,
        "https://proconnect.gouv.fr/assurance/self-asserted",
      ),
    ).toBeTruthy();
  });

  it("should return true for prompt with no acr required", () => {
    const prompt = { name: "login", reasons: ["no_session"], details: {} };

    expect(
      isAcrSatisfied(
        prompt,
        "https://proconnect.gouv.fr/assurance/self-asserted",
      ),
    ).toBeTruthy();
  });

  it("should return true for consistency checked identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "https://proconnect.gouv.fr/assurance/consistency-checked",
        },
      },
    };

    expect(
      isAcrSatisfied(
        prompt,
        "https://proconnect.gouv.fr/assurance/consistency-checked",
      ),
    ).toBeTruthy();
  });
  it("should return false for self-asserted identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acr"],
      details: {
        acr: {
          essential: true,
          value: "https://proconnect.gouv.fr/assurance/consistency-checked",
        },
      },
    };

    expect(
      isAcrSatisfied(
        prompt,
        "https://proconnect.gouv.fr/assurance/self-asserted",
      ),
    ).toBeFalsy();
  });
});

describe("isThereAnyRequestedAcr", () => {
  it("should return false for acr non-related prompt", () => {
    const prompt = {
      name: "random",
      reasons: ["random"],
      details: { random: "random" },
    };

    expect(isThereAnyRequestedAcr(prompt)).toBeFalsy();
  });

  it("should return true for prompt with no acr required", () => {
    const prompt = { name: "login", reasons: ["no_session"], details: {} };

    expect(isThereAnyRequestedAcr(prompt)).toBeFalsy();
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

    expect(isThereAnyRequestedAcr(prompt)).toBeFalsy();
  });

  it("should return true for non legacy acr", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: [
            "eidas1",
            "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
          ],
        },
      },
    };

    expect(isThereAnyRequestedAcr(prompt)).toBeTruthy();
  });

  it("should return true for mfa requested identity", () => {
    const prompt = {
      name: "login",
      reasons: ["essential_acrs"],
      details: {
        acr: {
          essential: true,
          values: [
            "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
            "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
          ],
        },
      },
    };

    expect(isThereAnyRequestedAcr(prompt)).toBeTruthy();
  });
});

describe("certificationDirigeantRequested", () => {
  it("should return true for certification dirigeant acr", () => {
    const prompt = {
      details: {
        acr: {
          essential: true,
          values: [
            "https://proconnect.gouv.fr/assurance/certification-dirigeant",
          ],
        },
      },
      name: "login",
      reasons: ["essential_acrs"],
    };

    expect(certificationDirigeantRequested(prompt)).toBeTruthy();
  });

  it("should return false if non certification dirigeant acr are requested", () => {
    const prompt = {
      details: {
        acr: {
          essential: true,
          values: [
            "https://proconnect.gouv.fr/assurance/certification-dirigeant",
            "https://proconnect.gouv.fr/assurance/consistency-checked",
            "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
            "https://proconnect.gouv.fr/assurance/self-asserted",
            "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
          ],
        },
      },
      name: "login",
      reasons: ["essential_acrs"],
    };

    expect(certificationDirigeantRequested(prompt)).toBeFalsy();
  });
});
