//

describe("sign-in with email verification renewal", () => {
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

    cy.maildevGetMessageBySubject("Vérification de votre adresse email")
      .then((email) => {
        cy.maildevDeleteMessageById(email.id);
        return cy.maildevGetOTPCode(email.text, 10);
      })
      .then((code) => {
        if (!code)
          throw new Error("Could not find verification code in received email");
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
        "J'ai attendu quelques secondes et je ne reçois pas de code de vérification",
      )
      .click();

    cy.contains("Vous ne recevez pas le code de vérification");

    cy.get('[action="/users/send-email-verification"]  [type="submit"]')
      .contains("Cliquez ici pour recevoir un nouveau code")
      .should("be.disabled");

    // Wait for countdown to last
    cy.wait(10 * 1000);

    cy.maildevDeleteAllMessages();

    cy.get('[action="/users/send-email-verification"]  [type="submit"]')
      .contains("Cliquez ici pour recevoir un nouveau code")
      .click();

    cy.contains(
      "Un nouveau code de vérification a été envoyé à b8a1959b-7034-433a-86d9-55dae207e185@mailslurp.com",
    );

    cy.maildevGetMessageBySubject("Vérification de votre adresse email")
      .then((email) => {
        cy.maildevDeleteMessageById(email.id);
        return cy.maildevGetOTPCode(email.text, 10);
      })
      .then((code) => {
        if (!code)
          throw new Error("Could not find verification code in received email");
        cy.get('[name="verify_email_token"]').type(code);
        cy.get('[type="submit"]').click();
      });

    cy.contains("Votre compte ProConnect");
  });
});
