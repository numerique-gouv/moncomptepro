//

describe("sign-in with magic link", () => {
  it("should sign-up with magic link", function () {
    cy.visit("/users/start-sign-in");

    cy.get('[name="login"]').type(
      "66ac0a4c-bd2d-490e-a277-1e7c2520100d@mailslurp.com",
    );
    cy.get('[type="submit"]').click();

    cy.get('[action="/users/send-magic-link"]  [type="submit"]')
      .contains("Envoyer le lien")
      .click();

    cy.contains("Votre lien vous attend à l’adresse...");

    cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.contains(
          "Vous avez demandé un lien de connexion à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
        );
        cy.contains("Se connecter").click();
        cy.maildevDeleteMessageById(email.id);
      },
    );

    cy.contains("Renseigner son identité");
  });

  it("should sign-in with magic link without setting password", function () {
    cy.visit("/users/start-sign-in");

    cy.get('[name="login"]').type(
      "66ac0a4c-bd2d-490e-a277-1e7c2520100d@mailslurp.com",
    );
    cy.get('[type="submit"]').click();

    cy.contains(
      "Pour des raisons de sécurité, nous vous invitons à définir un nouveau mot de passe",
    );

    cy.get('[action="/users/send-magic-link"]  [type="submit"]')
      .contains("Envoyer le lien")
      .click();

    cy.contains("Votre lien vous attend à l’adresse...");

    cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.contains(
          "Vous avez demandé un lien de connexion à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
        );
        cy.contains("Se connecter").click();
        cy.maildevDeleteMessageById(email.id);
      },
    );

    cy.contains("Renseigner son identité");
  });

  it("should set a password", function () {
    cy.visit("/users/start-sign-in");

    cy.get('[name="login"]').type(
      "66ac0a4c-bd2d-490e-a277-1e7c2520100d@mailslurp.com",
    );
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type(
      "This super secret password is hidden well!",
    );
    cy.get('[action="/users/sign-up"]  [type="submit"]').click();

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

    cy.contains("Renseigner son identité");
  });

  it("should sign-in with magic link without set password prompt", function () {
    cy.visit("/users/start-sign-in");

    cy.get('[name="login"]').type(
      "66ac0a4c-bd2d-490e-a277-1e7c2520100d@mailslurp.com",
    );
    cy.get('[type="submit"]').click();

    cy.contains(
      "Pour des raisons de sécurité, nous vous invitons à définir un nouveau mot de passe",
    ).should("not.exist");

    cy.get('[action="/users/send-magic-link"]  [type="submit"]')
      .contains("Recevoir un lien d’identification")
      .click();

    cy.contains("Votre lien vous attend à l’adresse...");

    cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.contains(
          "Vous avez demandé un lien de connexion à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
        );
        cy.contains("Se connecter").click();
        cy.maildevDeleteMessageById(email.id);
      },
    );
    cy.contains("Renseigner son identité");
  });
});
