describe("force recent connexion + 2FA on admin pages", () => {
  it("should be redirected after long connexion", function () {
    cy.visit("/");

    cy.login("unused1@yopmail.com");

    cy.contains("Votre compte ProConnect");

    cy.visit("/connection-and-account");

    cy.contains("merci de valider votre deuxième étape de connexion");

    cy.fillTotpFields();

    cy.contains("Compte et connexion");

    // Wait for connexion to last
    cy.wait(5 * 1000);

    cy.get("form[action='/delete-authenticator-app-configuration']").submit();

    cy.contains("merci de vous identifier à nouveau");

    cy.mfaLogin("unused1@yopmail.com");

    cy.contains("Compte et connexion");
  });
});
