//

import { defineConfig } from "cypress";

//

export default defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 60000,
  pageLoadTimeout: 60000,
  e2e: {
    baseUrl: Cypress.env("MONCOMPTEPRO_HOST") || "http://localhost:3000",
    setupNodeEvents,
  },
  video: true,
});

//

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
) {
  return config;
}
