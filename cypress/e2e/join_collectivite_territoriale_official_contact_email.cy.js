const MONCOMPTEPRO_HOST =
  Cypress.env('MONCOMPTEPRO_HOST') || 'http://localhost:3000';

describe('join organizations', () => {
  before(() => {
    cy.mailslurp().then(mailslurp =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: '435f6a4d-df7d-4840-be7b-bc4851b64e91',
      })
    );
  });

  it('join collectivité territoriale with official contact email', function() {
    cy.login(
      '435f6a4d-df7d-4840-be7b-bc4851b64e91@mailslurp.com',
      'password123'
    );

    cy.visit(`${MONCOMPTEPRO_HOST}/users/join-organization`);
    cy.get('[name="siret"]').type('21340126800130');
    cy.get('[type="submit"]').click();

    cy.contains('Votre compte est créé');
  });
});
