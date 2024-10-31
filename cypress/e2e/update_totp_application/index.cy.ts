import { generateToken } from "@sunknudsen/totp";

describe("update TOTP application", () => {
  it("should update TOTP application, and replace old app with new", function () {
    cy.visit("/connection-and-account");

    cy.mfaLogin("alpharius.omegon@alphalegion.world");

    cy.contains("Compte et connexion").click();

    cy.contains("Changer d’application d’authentification").click();

    cy.contains("Changer d’application d’authentification");

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

    cy.contains("L’application d’authentification a été modifiée.");

    cy.maildevGetMessageBySubject(
      "Changement d'application d’authentification",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "Le changement d'application d'authentification a bien été prise en compte.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });
});
