//

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

Cypress.Commands.add("login", (email, password) => {
  cy.session([email, password], () => {
    // Visit the signup page
    cy.visit(`/users/start-sign-in`);

    // Sign in with the existing inbox
    cy.get('[name="login"]').type(email);
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type(password);
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();
  });
});
