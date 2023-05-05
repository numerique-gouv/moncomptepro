const host = Cypress.env('MONCOMPTEPRO_HOST') || 'http://localhost:3000';

describe('join organizations', () => {
  it('join collectivité territoriale with official contact email', function() {
    cy.login(
      '34c5063f-81c0-4d09-9d0b-a7502f844cdf@mailslurp.com',
      'password123'
    );

    cy.visit(`${host}/users/join-organization`);
    cy.get('[name="siret"]').type('21340126800130');
    cy.get('[type="submit"]').click();

    cy.contains('Votre compte est créé');
  });

  it('following members can join the new organization if using the same email domain', function() {
    cy.login(
      '761a72f6-d051-4df5-a733-62e207c4989b@mailslurp.com',
      'password123'
    );

    cy.visit(`${host}/users/join-organization`);
    cy.get('[name="siret"]').type('21340126800130');
    cy.get('[type="submit"]').click();

    cy.contains('Votre compte est créé');
  });

  it('join collectivité territoriale with official contact domain', function() {
    cy.login(
      '761a72f6-d051-4df5-a733-62e207c4989b@mailslurp.com',
      'password123'
    );

    cy.visit(`${host}/users/join-organization`);
    cy.get('[name="siret"]').type('21740056300011');
    cy.get('[type="submit"]').click();

    cy.contains('Votre compte est créé');
  });
});
