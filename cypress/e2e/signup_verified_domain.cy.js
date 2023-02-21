const host = Cypress.env('MONCOMPTEPRO_HOST') || 'http://localhost:3000';

describe('join organizations', () => {
  beforeEach(() => {
    cy.login(
      '07b88769-a5fc-4f8b-a4b3-fcab28d32f94@mailslurp.com',
      'password123'
    );
  });

  it('join suggested organisation', function() {
    // Visit the signup page
    cy.visit(`${host}/`);

    // Click on the suggested organization
    cy.get('.fr-grid-row .fr-tile__link').contains(
      'Commune de clamart - Mairie'
    );
    cy.get('.fr-grid-row .fr-tile__link').click();

    // Click on "continue" on the welcome page
    cy.get('[type="submit"]').click();

    // Check DataPass redirection
    cy.contains('Votre compte est créé');

    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then(mailslurp =>
        mailslurp.waitForLatestEmail(
          '34c5063f-81c0-4d09-9d0b-a7502f844cdf',
          30000,
          true
        )
      )
      // assert reception of confirmation email
      .then(email => {
        expect(email.subject).to.equal('Votre organisation sur MonComptePro');
      });
  });

  it('join another organisation', function() {
    // Visit the join organization page
    cy.visit(`${host}/users/join-organization`);
    cy.get('[name="siret"]').type('21740056300011');
    cy.get('[type="submit"]').click();

    // Check DataPass redirection
    cy.contains(
      'Bonne nouvelle, l’organisation Commune de chamonix mont blanc - Mairie chamonix - argentiere utilise déjà MonComptePro !'
    );
  });
});
