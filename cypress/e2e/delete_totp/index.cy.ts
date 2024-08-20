import { generateToken } from "@sunknudsen/totp";

describe("delete TOTP connexion", () => {
  it("should delete TOTP application", function () {
    // Visit the signup page
    cy.visit(`/users/start-sign-in`);

    cy.get('[name="login"]').type(
      "eab4ab97-875d-4ec7-bdcc-04323948ee63@mailslurp.com",
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

    cy.contains("Application FreeOTP Authenticator");

    cy.contains("Supprimer l’application d’authentification").click();

    cy.contains("L’application d’authentification a bien été supprimée.");

    cy.maildevGetLastMessage().then((email) => {
      expect(email.subject).to.equal(
        "Suppression d'une application d'authentification à double facteur",
      );
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "L'application a été supprimée comme étape de connexion à deux facteurs.",
      );
    });
  });

  it("should disable TOTP", function () {
    // Visit the signup page
    cy.visit(`/users/start-sign-in`);

    cy.get('[name="login"]').type(
      "c9fabb94-9274-4ece-a3d0-54b1987c8588@mailslurp.com",
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

    cy.contains("Désactiver la validation en deux étapes").click();

    cy.maildevGetLastMessage().then((email) => {
      expect(email.subject).to.equal(
        "Désactivation de la validation en deux étapes",
      );
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "Votre compte MonComptePro n'est plus protégé par la validation en deux",
      );
    });
  });
});
