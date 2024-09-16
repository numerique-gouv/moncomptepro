describe("force recent connexion + 2FA on admin pages", () => {
  it("should be redirected after long connexion", function () {
    cy.visit("/");

    cy.login("unused1@yopmail.com");

    cy.contains("Votre compte est créé");

    cy.visit("/connection-and-account");

    cy.contains("merci de valider votre deuxième étape de connexion");

    cy.fillTotpFields();

    cy.contains("Connexion et compte");

    // Wait for connexion to last
    cy.wait(5 * 1000);

    cy.get(
      '[action="/delete-authenticator-app-configuration"]  [type="submit"]',
    )
      .contains("Supprimer l’application d’authentification")
      .click();

    cy.contains("merci de vous identifier à nouveau");

    cy.mfaLogin("unused1@yopmail.com");

    cy.contains("Connexion et compte");
  });
});
