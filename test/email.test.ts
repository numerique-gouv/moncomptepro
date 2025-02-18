import { describe, expect, it } from "vitest";
import { usesAFreeEmailProvider } from "../src/services/email";

describe("usesAFreeEmailProvider", () => {
  const emailAddressesThatUsesFreeEmailProviders = [
    "user@gmail.com",
    "collectivite@wanadoo.fr",
    "collectivite@orange.fr",
    "serious@9business.fr",
  ];

  emailAddressesThatUsesFreeEmailProviders.forEach((email) => {
    it("should return true for free email provider address", () => {
      expect(usesAFreeEmailProvider(email)).toBeTruthy();
    });
  });

  const professionalEmailAddresses = [
    "user@beta.gouv.fr",
    "collectivite@paris.fr",
    "nom.prenom@notaires.fr",
  ];

  professionalEmailAddresses.forEach((professionalEmailAddress) => {
    it("should return false for non free provider email address", () => {
      expect(usesAFreeEmailProvider(professionalEmailAddress)).toBeFalsy();
    });
  });
});
