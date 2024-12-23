import { assert } from "chai";
import { HOST } from "../src/config/env";
import {
  getTrustedReferrerPath,
  isPasswordSecure,
  isVisibleString,
} from "../src/services/security";

describe("isVisibleString", () => {
  const nonVisibleStrings = [
    "",
    "\n",
    " ",
    "​", // zero width space character
    "‎", // left to right mark character
    " ​‎",
  ];

  nonVisibleStrings.forEach((nonVisibleString) => {
    it(`should return false for non-visible string: ${nonVisibleString}`, () => {
      assert.equal(isVisibleString(nonVisibleString), false);
    });
  });

  const visibleStrings = ["​a", "a"];

  visibleStrings.forEach((visibleString) => {
    it(`should return true for visible string: ${visibleString}`, () => {
      assert.equal(isVisibleString(visibleString), true);
    });
  });
});

describe("isUrlTrusted", () => {
  it("should not trust null url", () => {
    assert.equal(getTrustedReferrerPath(null), null);
  });
  it("should not trust no string url", () => {
    assert.equal(getTrustedReferrerPath(["api.gouv.fr"]), null);
  });
  it("should not trust empty url", () => {
    assert.equal(getTrustedReferrerPath(""), null);
  });
  it("should not trust external domain (over https)", () => {
    assert.equal(getTrustedReferrerPath("https://www.google.com"), null);
  });
  it("should trust relative path", () => {
    assert.equal(
      getTrustedReferrerPath("/users/join-organization"),
      "/users/join-organization",
    );
  });
  it("should trust absolute path on same domain", () => {
    assert.equal(
      getTrustedReferrerPath(`${HOST}/users/join-organization`),
      "/users/join-organization",
    );
  });
});

describe("isPasswordSecure", () => {
  it("should return false for too short password", () => {
    assert.equal(
      isPasswordSecure("password", "user1234567890@test.com"),
      false,
    );
  });
  it("should return false for password with only 2 types of character", () => {
    assert.equal(
      isPasswordSecure("mon mot de passe", "user1234567890@test.com"),
      false,
    );
  });
  it("should return true for long enough password with 4 types of character", () => {
    assert.equal(
      isPasswordSecure("Password123!", "user1234567890@test.com"),
      true,
    );
  });
  it("should return true for passphrase", () => {
    assert.equal(
      isPasswordSecure(
        "agrafe correcte de la batterie du cheval",
        "user1234567890@test.com",
      ),
      true,
    );
  });
  ["Pro Connect forever", "MonComptePro-2023!"].forEach((blacklistedWord) => {
    it("should not contains blacklisted word", () => {
      assert.equal(
        isPasswordSecure(blacklistedWord, "user1234567890@test.com"),
        false,
      );
    });
  });
  it("should not contains users email address", () => {
    assert.equal(
      isPasswordSecure("User1234567890@test.com!", "user1234567890@test.com"),
      false,
    );
  });
});
