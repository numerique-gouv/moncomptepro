// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import "cypress-axe";
import "cypress-maildev";

import "./commands";

const RECORD = Cypress.env("RECORD") === true;

if (RECORD) {
  ["visit", "click", "trigger", "type", "clear", "reload", "select"].forEach(
    (command) => {
      Cypress.Commands.overwrite(
        command as unknown as keyof Cypress.Chainable<any>,
        (originalFn, ...args) => {
          const origVal = originalFn(...args);

          return new Promise((resolve) => {
            setTimeout(
              () => {
                resolve(origVal);
              },
              RECORD ? 2000 : 0,
            );
          });
        },
      );
    },
  );
  Cypress.config("viewportWidth", 2560);
  Cypress.config("viewportHeight", 1440);
}
