import { assert, expect } from "chai";
import {
  getEmailDomain,
  usesAFreeEmailProvider,
  usesAGouvFrDomain,
} from "../src/services/email";

describe("getEmailDomain", () => {
  const data = [
    {
      email: "user@beta.gouv.fr",
      domain: "beta.gouv.fr",
    },
    {
      email: "user@notaires.fr",
      domain: "notaires.fr",
    },
    {
      email: "user@subdomain.domain.org",
      domain: "subdomain.domain.org",
    },
  ];

  data.forEach(({ email, domain }) => {
    it("should return email domain", () => {
      assert.equal(getEmailDomain(email), domain);
    });
  });
});

describe("usesAFreeEmailProvider", () => {
  const emailAddressesThatUsesFreeEmailProviders = [
    "user@gmail.com",
    "collectivite@wanadoo.fr",
    "collectivite@orange.fr",
  ];

  emailAddressesThatUsesFreeEmailProviders.forEach((email) => {
    it("should return true for free email provider address", () => {
      assert.equal(usesAFreeEmailProvider(email), true);
    });
  });

  const professionalEmailAddresses = [
    "user@beta.gouv.fr",
    "collectivite@paris.fr",
    "nom.prenom@notaires.fr",
  ];

  professionalEmailAddresses.forEach((professionalEmailAddress) => {
    it("should return false for non free provider email address", () => {
      assert.equal(usesAFreeEmailProvider(professionalEmailAddress), false);
    });
  });
});

describe("usesAGouvFrDomain", () => {
  const emailAddressesThatUseGouvFrDomain = [
    "user@beta.gouv.fr",
    "user@interieur.gouv.fr",
    "user@pm.gouv.fr",
    "user@sub.domain.gouv.fr",
  ];

  emailAddressesThatUseGouvFrDomain.forEach((email) => {
    it("should return true for email that uses gouv.fr domains", () => {
      assert.equal(usesAGouvFrDomain(email), true);
    });
  });

  const nonGouvFrEmailAddresses = [
    "user@beta.agouv.fr",
    "user@beta.gouv.fr.co",
    "user@gouv.fr",
    "user@paris.fr",
  ];

  nonGouvFrEmailAddresses.forEach((nonGouvFrEmailAddress) => {
    it("should return false for non gouv.fr email address", () => {
      assert.equal(usesAGouvFrDomain(nonGouvFrEmailAddress), false);
    });
  });

  const nonValidEmailAddresses = ["user@beta.gouv.fra"];

  nonValidEmailAddresses.forEach((nonValidEmailAddress) => {
    it("should return false for non gouv.fr email address", () => {
      expect(() => usesAGouvFrDomain(nonValidEmailAddress)).to.throw(
        'Invalid TLD {"parts":["beta","gouv","fra"],"tld_level":-1,"allowUnknownTLD":false}',
      );
    });
  });
});
