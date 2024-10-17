import { assert } from "chai";
import { getEmailDomain, usesAFreeEmailProvider } from "../src/services/email";

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
    "serious@9business.fr",
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
