describe('The signup flow', () => {
  before(function() {
    return cy
      .mailslurp()
      .then(mailslurp => mailslurp.createInbox())
      .then(inbox => {
        // save inbox id and email address to this (make sure you use function and not arrow syntax)
        cy.wrap(inbox.id).as('inboxId');
        cy.wrap(inbox.emailAddress).as('emailAddress');
      });
  });

  it('creates a user', function() {
    cy.visit('http://localhost:4000/users/sign-up');
    cy.get('[name="login"]').type(this.emailAddress);
    cy.get('[name="password"]').type(this.emailAddress);
    cy.get('[type="submit"]').click();

    cy.get('#verify-email > p').contains(this.emailAddress);

    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then(mailslurp =>
        mailslurp.waitForLatestEmail(this.inboxId, 30000, true)
      )
      // extract the confirmation code from the email body
      .then(email => /.*blank"><strong>(\d{10})<.*/.exec(email.body)[1])
      // fill out the confirmation form and submit
      .then(code => {
        cy.get('[name="verify_email_token"]').type(code);
        cy.get('[value="Confirmer mon email"]').click();
      });
  });
});
