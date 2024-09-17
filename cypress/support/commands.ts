//

import { generateToken } from "@sunknudsen/totp";
import { checkA11y } from "./a11y/checkA11y";

//

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

//

Cypress.Commands.overwrite("checkA11y", checkA11y);

const defaultTotpSecret = "din5ncvbluqpx7xfzqcybmibmtjocnsf";
const defaultPassword = "password123";

Cypress.Commands.add("fillTotpFields", (totpSecret = defaultTotpSecret) => {
  const totp = generateToken(totpSecret, Date.now());
  cy.get("[name=totpToken]").type(totp);
  cy.get(
    '[action="/users/2fa-sign-in-with-authenticator-app"] [type="submit"]',
  ).click();
});

Cypress.Commands.add(
  "fillLoginFields",
  ({ email, password = defaultPassword, totpSecret }) => {
    // Sign in with the existing inbox
    cy.get('[name="login"]').type(email);
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type(password);
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    if (totpSecret) {
      // redirect to the TOTP login page
      cy.contains("Valider en deux étapes");

      cy.fillTotpFields(totpSecret);
    }
  },
);

Cypress.Commands.add("login", (email) => {
  cy.fillLoginFields({ email, password: defaultPassword });
});

Cypress.Commands.add("mfaLogin", (email) => {
  cy.fillLoginFields({
    email,
    password: defaultPassword,
    totpSecret: defaultTotpSecret,
  });
});
