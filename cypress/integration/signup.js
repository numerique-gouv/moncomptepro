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
    // Visit the signup page
    cy.visit('http://localhost:3000/users/sign-up');

    // Sign up with the previously created inbox
    cy.get('[name="login"]').type(this.emailAddress);
    cy.get('[name="password"]').type(this.emailAddress);
    cy.get('[type="submit"]').click();

    // Check that the website is waiting for the user to confirm their email
    cy.get('#verify-email > p').contains(this.emailAddress);

    // Confirm the email with the code received by email
    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then(mailslurp =>
        mailslurp.waitForLatestEmail(this.inboxId, 30000, true)
      )
      // extract the confirmation code from the email body
      .then(email => {
        const sendinBlueMatches = /.*blank"><strong>(\d{10})<.*/.exec(
          email.body
        );
        const mailjetMatches = /.*line-height:150%;text-align:center;color:#000091;">(\d{10})<.*/.exec(
          email.body
        );
        if (sendinBlueMatches && sendinBlueMatches.length > 0) {
          return sendinBlueMatches[1];
        }
        if (mailjetMatches && mailjetMatches.length > 0) {
          return mailjetMatches[1];
        }
        throw new Error('Could not find verification code in received email');
      })
      // fill out the confirmation form and submit
      .then(code => {
        cy.get('[name="verify_email_token"]').type(code);
        cy.get('[value="Confirmer mon email"]').click();
      });

    // Fill the user's personal information
    cy.get('[name="given_name"]').type('Georges');
    cy.get('[name="family_name"]').type('Moustaki');
    cy.get('[name="phone_number"]').type('0606060606');
    cy.get('[name="job"]').type('Chargé de relation usager');
    cy.get('[type="submit"]').click();

    // Fill the user's organization information
    cy.get('[name="siret"]').type('13002526500013');
    cy.get('[type="submit"]').click();

    // Check DataPass redirection
    cy.contains('Bienvenue sur DataPass !');
  });
});
