//

import { getVerificationCodeFromEmail } from "#cypress/support/get-from-email";

describe("sign-in with email verification renewal", () => {
  before(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "8c23383c-e1df-45d6-a3e9-94f207256c2a",
      }),
    );
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "b8a1959b-7034-433a-86d9-55dae207e185",
      }),
    );
  });

  it("should sign-in with email verification needed", () => {
    cy.visit("/users/start-sign-in");

    cy.login("8c23383c-e1df-45d6-a3e9-94f207256c2a@mailslurp.com");

    cy.contains("Vérifier votre email");

    cy.contains(
      "Information : pour garantir la sécurité de votre compte, nous avons besoin d’authentifier votre navigateur.",
    );

    cy.contains(
      "Un code de vérification a été envoyé à 8c23383c-e1df-45d6-a3e9-94f207256c2a@mailslurp.com",
    );

    cy.mailslurp()
      .then((mailslurp) =>
        mailslurp.waitForLatestEmail(
          "8c23383c-e1df-45d6-a3e9-94f207256c2a",
          60000,
          true,
        ),
      )
      .then(getVerificationCodeFromEmail)
      // fill out the verification form and submit
      .then((code) => {
        cy.get('[name="verify_email_token"]').type(code);
        cy.get('[type="submit"]').click();
      });

    cy.contains("Votre compte ProConnect");
  });

  it("should be able to sign in after re-sending code", () => {
    cy.visit("/users/start-sign-in");

    cy.login("b8a1959b-7034-433a-86d9-55dae207e185@mailslurp.com");

    cy.get('a[href="/users/verify-email-help"]')
      .contains(
        "J'ai attendu 15 minutes et je ne reçois pas de code de vérification",
      )
      .click();

    cy.contains("Vous ne recevez pas le code de vérification");
  });
});
