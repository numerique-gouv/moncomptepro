//

import { getVerificationWordsFromEmail } from "#cypress/support/get-from-email";

describe("join organizations", () => {
  before(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "26ccc0fa-0dc3-4f12-9335-7bb00282920c",
      }),
    );
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "c348a2c3-bf54-4f15-bb12-a2d7047c832f",
      }),
    );
  });

  it("join collectivité territoriale with code send to official contact email", function () {
    cy.visit(`/users/join-organization`);
    cy.login("c348a2c3-bf54-4f15-bb12-a2d7047c832f@mailslurp.com");

    cy.get('[name="siret"]').type("21340126800130");
    cy.get('[type="submit"]').click();

    // Check that the website is waiting for the user to verify their email
    cy.contains(
      "nous avons envoyé un code secret à l’adresse email de votre mairie",
    );
    cy.get("#email-badge-lowercase").contains(
      "26ccc0fa-0dc3-4f12-9335-7bb00282920c@mailslurp.com",
    );

    // Verify the email with the code received by email
    cy.mailslurp()
      .then((mailslurp) =>
        mailslurp.waitForLatestEmail(
          "26ccc0fa-0dc3-4f12-9335-7bb00282920c",
          60000,
          true,
        ),
      )
      // extract the verification code from the email subject
      .then((email) => getVerificationWordsFromEmail(email))
      // fill out the verification form and submit
      .then((code) => {
        cy.get('[name="official_contact_email_verification_token"]').type(code);
        cy.get('[type="submit"]').click();
      });

    cy.contains("Votre compte est créé");
  });
});
