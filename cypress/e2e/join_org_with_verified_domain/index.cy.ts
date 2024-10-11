//

//

describe("join organizations", () => {
  before(() => {
    return cy.mailslurp().then((mailslurp) =>
      Promise.all([
        mailslurp.inboxController.deleteAllInboxEmails({
          inboxId: "c6c64542-5601-43e0-b320-b20da72f6edc",
        }),
      ]),
    );
  });

  it("join suggested organisation", function () {
    cy.visit("/");
    cy.login("c6c64542-5601-43e0-b320-b20da72f6edc@mailslurp.com");

    // The user gets this suggestion because it as mailslurp.com as verified domain
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").contains(
      "Commune de clamart - Mairie",
    );

    // The user gets this suggestion because last because it has fewer members
    cy.get(".fr-grid-row .fr-col-12:last-child .fr-tile__link").contains(
      "Commune de clamart - Service assainissement",
    );

    // Click on the suggested organization
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").click();

    // Click on "continue" on the welcome page
    cy.get('[type="submit"]').click();

    // Check redirection to home page
    cy.contains("Votre compte est créé");
  });

  it("join another organisation", function () {
    cy.visit("/users/join-organization");
    cy.login("c6c64542-5601-43e0-b320-b20da72f6edc@mailslurp.com");

    cy.get('[name="siret"]').type("13002526500013");
    cy.get('[type="submit"]').click();

    // Check redirection to moderation block page
    cy.contains(
      "Notre équipe étudie votre demande de rattachement à l’organisation Direction interministerielle du numerique (DINUM) avec l’adresse email c6c64542-5601-43e0-b320-b20da72f6edc@mailslurp.com",
    );

    // Try to change org
    cy.get('a[href^="/users/edit-moderation"]')
      .contains("J’ai fait une erreur dans ma demande")
      .click();
    cy.get('[action^="/users/cancel-moderation-and-redirect-to-join-org/"]')
      .contains("Sélectionner une organisation différente")
      .click();

    cy.get('[name="siret"]').type("13002526500013");
    cy.get('[type="submit"]').click();
    cy.contains("Notre équipe étudie votre demande");

    // Try to change email
    cy.get('a[href^="/users/edit-moderation"]')
      .contains("J’ai fait une erreur dans ma demande")
      .click();
    cy.get('[action^="/users/cancel-moderation-and-redirect-to-sign-in/"]')
      .contains("Utiliser une autre adresse email")
      .click();
    cy.contains("S’inscrire ou se connecter");
  });
});
