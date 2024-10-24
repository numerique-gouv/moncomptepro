import { getVerificationCodeFromEmail } from "#cypress/support/get-from-email";

describe("sign-in with TOTP on untrusted browser", () => {
  beforeEach(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "181eb568-ca3d-4995-8b06-a717a83421fd",
      }),
    );
  });
  it("should sign-in with password and TOTP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.mfaLogin("unused1@yopmail.com");

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });

  it("should sign-in with password and no TOTP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.login("181eb568-ca3d-4995-8b06-a717a83421fd@mailslurp.com");

    cy.contains(
      "Information : pour garantir la sécurité de votre compte, nous avons besoin d’authentifier votre navigateur.",
    );

    cy.mailslurp()
      .then((mailslurp) =>
        mailslurp.waitForLatestEmail(
          "181eb568-ca3d-4995-8b06-a717a83421fd",
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

    cy.contains("moncomptepro-standard-client");
  });

  it("should sign-in with password and TOTP when forced by SP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button#force-2fa").click();

    cy.mfaLogin("181eb568-ca3d-4995-8b06-a717a83421fd@mailslurp.com");

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });

  it("should only show totp step when already logged", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.login("181eb568-ca3d-4995-8b06-a717a83421fd@mailslurp.com");

    cy.mailslurp()
      .then((mailslurp) =>
        mailslurp.waitForLatestEmail(
          "181eb568-ca3d-4995-8b06-a717a83421fd",
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

    cy.contains("moncomptepro-standard-client");

    cy.get("button#force-2fa").click();

    cy.contains("Valider en deux étapes");

    cy.fillTotpFields();

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });

  it("should trigger totp rate limiting", function () {
    cy.visit("/users/start-sign-in");

    cy.login("unused3@yopmail.com");

    for (let i = 0; i < 5; i++) {
      cy.get("[name=totpToken]").type("123456");
      cy.get(
        '[action="/users/2fa-sign-in-with-authenticator-app"] [type="submit"]',
      ).click();
      cy.contains("le code que vous avez utilisé est invalide.");
    }

    cy.get("[name=totpToken]").type("123456");
    cy.get(
      '[action="/users/2fa-sign-in-with-authenticator-app"] [type="submit"]',
    ).click();
    cy.contains("Too Many Requests");
  });
});
