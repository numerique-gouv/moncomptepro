describe("delete TOTP connexion", () => {
  it("should delete TOTP application", function () {
    cy.visit("/connection-and-account");

    cy.mfaLogin("eab4ab97-875d-4ec7-bdcc-04323948ee63@mailslurp.com");

    cy.contains("Configurer un code à usage unique");

    cy.contains("Supprimer l’application d’authentification").click();

    cy.contains("L’application d’authentification a bien été supprimée.");

    cy.maildevGetMessageBySubject(
      "Suppression d'une application d'authentification à double facteur",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "L'application a été supprimée comme étape de connexion à deux facteurs.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });

  it("should not be ask to sign with TOTP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();
    cy.login("eab4ab97-875d-4ec7-bdcc-04323948ee63@mailslurp.com");

    cy.contains('"amr": [\n    "pwd"\n  ],');
  });

  it("should disable TOTP", function () {
    cy.visit("/connection-and-account");

    cy.mfaLogin("c9fabb94-9274-4ece-a3d0-54b1987c8588@mailslurp.com");

    cy.contains("Validation en deux étapes");

    cy.contains("Désactiver la validation en deux étapes").click();

    cy.maildevGetMessageBySubject(
      "Désactivation de la validation en deux étapes",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "Votre compte ProConnect n'est plus protégé par la validation en deux étapes.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });

  it("should not be ask to sign with TOTP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();
    cy.login("c9fabb94-9274-4ece-a3d0-54b1987c8588@mailslurp.com");

    cy.contains('"amr": [\n    "pwd"\n  ],');
  });
});
