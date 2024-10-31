import { generateToken } from "@sunknudsen/totp";

describe("add 2fa authentication", () => {
  it("should add 2fa authentication on account user", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.contains("Configurer un code à usage unique");

    cy.get('[href="/authenticator-app-configuration"]')
      .contains("Configurer un code à usage unique")
      .click();

    // Extract the code from the front to generate the TOTP key
    cy.get("#humanReadableTotpKey")
      .invoke("text")
      .then((text) => {
        const humanReadableTotpKey = text.trim().replace(/\s+/g, "");
        const totp = generateToken(humanReadableTotpKey, Date.now());
        cy.get("[name=totpToken]").type(totp);
        cy.get(
          '[action="/authenticator-app-configuration"] [type="submit"]',
        ).click();
      });

    cy.contains("L’application d’authentification a été configurée.");

    cy.maildevGetMessageBySubject("Validation en deux étapes activée").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.contains(
          "Votre compte ProConnect lion.eljonson@darkangels.world est à présent protégé par la validation en deux étapes",
        );
        cy.maildevDeleteMessageById(email.id);
      },
    );
  });
});
