import { assert } from "chai";
import {
  getTrustedReferrerPath,
  isEmailValid,
  isNameValid,
  isPasswordSecure,
  isSiretValid,
} from "../src/services/security";
import { MONCOMPTEPRO_HOST } from "../src/config/env";

describe("isEmailValid", () => {
  it("should return false for undefined value", () => {
    assert.equal(isEmailValid(undefined), false);
  });

  it("should return false for empty string", () => {
    assert.equal(isEmailValid(""), false);
  });

  it("should return false if no @ is present", () => {
    assert.equal(isEmailValid("test"), false);
  });

  it("should return false if no domain is present", () => {
    assert.equal(isEmailValid("test@"), false);
  });

  it("should return false if two @ are present", () => {
    assert.equal(isEmailValid("test@test@test"), false);
  });

  it("should return false if domains contain other than letters, numbers, hyphens (-) and periods (.)", () => {
    assert.equal(isEmailValid("test@test_test"), false);
  });

  it("should return false if tld has the wrong case", () => {
    assert.equal(isEmailValid("jean@wanadoo.Fr"), false);
  });

  it("should return false if local part is longer than 63 characters", () => {
    assert.equal(
      isEmailValid(
        "1234567890123456789012345678901234567890123456789012345678901234@test",
      ),
      false,
    );
  });

  it("should return false if total length is longer than 254 characters", () => {
    assert.equal(
      isEmailValid(
        "test@1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",
      ),
      false,
    );
  });

  // this test cases have been taken from
  // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript/32686261#32686261
  const validEmailAddresses = [
    "prettyandsimple@example.com",
    "very.common@example.com",
    "disposable.style.email.with+symbol@example.com",
    "other.email-with-dash@example.com",
    "#!$%&'*+-/=?^_`{}|~@example.org",
    '"()[]:,;\\"!#$%&\'*+-/=?^_`{}| ~.a"@example.org',
    '" "@example.org', // space between the quotes
    "üñîçøðé@example.com", // Unicode characters in local part
    "Pelé@example.com", // Latin
  ];

  validEmailAddresses.forEach((validEmailAddress) => {
    it("should return true for valid email address", () => {
      assert.equal(isEmailValid(validEmailAddress), true);
    });
  });
});

describe("isSiretValid", () => {
  it("should return false for undefined value", () => {
    assert.equal(isSiretValid(undefined), false);
  });

  it("should return false for empty string", () => {
    assert.equal(isSiretValid(""), false);
  });

  it("should return false if it contains characters other than number", () => {
    assert.equal(isSiretValid("a2345678901234"), false);
  });

  it("should return false if it contains more that 14 numbers", () => {
    assert.equal(isSiretValid("123456789012345"), false);
  });

  it("should return false if it contains less that 14 numbers", () => {
    assert.equal(isSiretValid("1234567890123"), false);
  });

  it("should return true if it contains exactly 14 numbers", () => {
    assert.equal(isSiretValid("12345678901234"), true);
  });

  it("should return true if it contains exactly 14 numbers with spaces", () => {
    assert.equal(isSiretValid("   123 456  789\n\r01234 \n"), true);
  });
});

describe("isNameValid", () => {
  const invalidNames = [
    null,
    "",
    "jean@domaine.fr",
    "dsi_etudes_applications",
    "R2 - Sebastien",
    "0000",
    "CCTV70",
    "0623456789",
    ";GOUZE",
    "Agathe/Carine",
    `<script>alert("hello")</script>`,
    "SG/PAFF/DDTM06",
    "Jean*Robert",
    "Jose_luis",
    "MME.",
    "Sabrina.b",
    "M.Christine",
    "Bousbecque59098*",
    "vAL2RIE",
    "Ch.",
    "YOANNI TH.",
    "M. le Président",
  ];

  invalidNames.forEach((invalidName) => {
    it(`should return false for invalid names : ${invalidName}`, () => {
      assert.equal(isNameValid(invalidName), false);
    });
  });

  const validNames = [
    "Jean",
    "Jean-Jean",
    "TAREK      WAJDI",
    "  Tania",
    "Надежда",
    "沃德天·",
    "อาทิตย์ นาถมทอง",
    "俊宇",
    "Doğan",
    "Hanåğğne",
    "سليمان خالد",
    "marcn     bh",
    "THỊ PHƯƠNG HỒNG",
    "Yamina⁵",
  ];

  validNames.forEach((validName) => {
    it(`should return true for valid names : ${validName}`, () => {
      assert.equal(isNameValid(validName), true);
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
      getTrustedReferrerPath(`${MONCOMPTEPRO_HOST}/users/join-organization`),
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
  ["cheval exact agrafe pile", "MonComptePro-2023!"].forEach(
    (blacklistedWord) => {
      it("should not contains blacklisted word", () => {
        assert.equal(
          isPasswordSecure(blacklistedWord, "user1234567890@test.com"),
          false,
        );
      });
    },
  );
  it("should not contains users email address", () => {
    assert.equal(
      isPasswordSecure("User1234567890@test.com!", "user1234567890@test.com"),
      false,
    );
  });
});
