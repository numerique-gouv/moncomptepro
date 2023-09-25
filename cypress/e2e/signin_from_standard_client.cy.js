const MONCOMPTEPRO_HOST =
  Cypress.env('MONCOMPTEPRO_HOST') || 'http://localhost:3000';

describe('sign-in from standard client', () => {
  it('should sign-in without org selection when having only one organization', function () {
    cy.visit(`http://localhost:4000`);
    cy.get('button.moncomptepro-button').click();

    cy.get('[name="login"]').type('unused1@yopmail.com');
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type('password123');
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains('Se connecter')
      .click();

    cy.contains('unused1@yopmail.com');
    cy.contains('Commune de lamalou-les-bains - Mairie');
  });

  it('should sign-in with org selection when having two organization', function () {
    cy.visit(`http://localhost:4000`);
    cy.get('button.moncomptepro-button').click();

    cy.get('[name="login"]').type('unused2@yopmail.com');
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type('password123');
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains('Se connecter')
      .click();

    cy.get('.fr-grid-row .fr-col-12:last-child .fr-tile__link').contains(
      'Commune de clamart - Mairie'
    );

    cy.get('.fr-grid-row .fr-col-12:last-child .fr-tile__link').click();

    cy.contains('unused2@yopmail.com');
    cy.contains('Commune de clamart - Mairie');
  });
});
