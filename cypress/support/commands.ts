/// <reference types="cypress" />

import { basename, dirname } from "path";
import { checkA11y } from "./a11y/checkA11y";

//

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      seed(): Chainable<void>;
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

Cypress.Commands.add("seed", () => {
  cy.log(Cypress.spec.relative);
  const scope = basename(dirname(Cypress.spec.relative));

  {
    const command = `docker compose --project-directory cypress/e2e/${scope} up --wait`;
    cy.task("log", `$ ${command}`);
    cy.exec(command, {
      env: {
        COMPTEPRO_ENV_FILE: `cypress/fixtures/${scope}.sql`,
      },
    }).then((result) => cy.task("log", result.stdout));
  }
});
