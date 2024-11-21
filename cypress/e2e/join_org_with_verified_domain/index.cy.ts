//

//

describe("join organizations", () => {
  it("join suggested organisation", function () {
    cy.visit("/");
    cy.login("lion.eljonson@darkangels.world");

    // The user gets this suggestion because it as darkangels.world as verified domain
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
    cy.contains("Votre compte ProConnect");
  });

  it("join another organisation", function () {
    cy.visit("/users/join-organization");
    cy.login("lion.eljonson@darkangels.world");

    cy.get('[name="siret"]').type("13002526500013");
    cy.get('[type="submit"]').click();

    // Check redirection to moderation block page
    cy.contains(
      "Notre équipe étudie votre demande de rattachement à l’organisation Direction interministerielle du numerique (DINUM) avec l’adresse email lion.eljonson@darkangels.world",
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
