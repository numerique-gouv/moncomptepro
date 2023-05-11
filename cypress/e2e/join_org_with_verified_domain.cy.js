const host = Cypress.env('MONCOMPTEPRO_HOST') || 'http://localhost:3000';

describe('join organizations', () => {
  before(() => {
    cy.mailslurp().then(mailslurp =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: '07b88769-a5fc-4f8b-a4b3-fcab28d32f94',
      })
    );
    cy.mailslurp().then(mailslurp =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: '34c5063f-81c0-4d09-9d0b-a7502f844cdf',
      })
    );
  });
  beforeEach(() => {
    cy.login(
      '07b88769-a5fc-4f8b-a4b3-fcab28d32f94@mailslurp.com',
      'password123'
    );
  });

  it('join suggested organisation', function() {
    // Visit the signup page
    cy.visit(`${host}/`);

    cy.get('.fr-grid-row .fr-col-12:first-child .fr-tile__link').contains(
      'Commune de clamart - Mairie'
    );
    cy.get('.fr-grid-row .fr-col-12:last-child .fr-tile__link').contains(
      'Commune de clamart - Service assainissement'
    );

    // Click on the suggested organization
    cy.get('.fr-grid-row .fr-col-12:first-child .fr-tile__link').click();

    // Click on "continue" on the welcome page
    cy.get('[type="submit"]').click();

    // Check redirection to home page
    cy.contains('Votre compte est créé');

    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then(mailslurp =>
        mailslurp.waitForLatestEmail(
          '34c5063f-81c0-4d09-9d0b-a7502f844cdf',
          60000,
          true
        )
      )
      // assert reception of confirmation email
      .then(email => {
        expect(email.subject).to.equal('Votre organisation sur MonComptePro');
      });

    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then(mailslurp =>
        mailslurp.waitForLatestEmail(
          '34c5063f-81c0-4d09-9d0b-a7502f844cdf',
          60000,
          true
        )
      )
      // assert reception of notification email
      .then(email => {
        expect(email.body).to.match(
          /Votre organisation.*Commune de clamart - Mairie.*utilise MonComptePro./
        );
        expect(email.body).to.match(
          /Nous tenions à vous informer que.*Jean User2.*\(07b88769-a5fc-4f8b-a4b3-fcab28d32f94@mailslurp.com\) vient de rejoindre cette organisation./
        );
      });
  });

  it('join another organisation', function() {
    // Visit the join organization page
    cy.visit(`${host}/users/join-organization`);
    cy.get('[name="siret"]').type('13002526500013');
    cy.get('[type="submit"]').click();

    // Check redirection to moderation block page
    cy.contains(
      'Notre équipe est en train de vous rattacher à cette organisation.'
    );
  });
});
