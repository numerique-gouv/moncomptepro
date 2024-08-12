import { generateToken } from "@sunknudsen/totp";

describe("update TOTP application", () => {
  it("should update TOTP application, and replace old app with new", function () {
    // Visit the signup page
    cy.visit(`/users/start-sign-in`);

    cy.get('[name="login"]').type(
      "d2469f84-9547-4190-b989-014876fd54ae@mailslurp.com",
    );
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    // redirect to the TOTP login page
    cy.contains("Valider en deux étapes");

    const totp = generateToken("din5ncvbluqpx7xfzqcybmibmtjocnsf", Date.now());
    cy.get("[name=totpToken]").type(totp);
    cy.get(
      '[action="/users/2fa-sign-in-with-authenticator-app"] [type="submit"]',
    ).click();

    cy.contains("Connexion et compte").click();

    cy.contains("Validation en deux étapes");

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

    cy.maildevGetLastMessage().then((email) => {
      expect(email.subject).to.equal(
        "Changement d'application d’authentification",
      );
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "Le changement d'application d'authentification a bien été prise en compte.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });
});
