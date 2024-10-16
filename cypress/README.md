# Run cypress locally

## Step by step with command lines

### Setup env vars

You will need to set `BREVO_API_KEY`, `CYPRESS_MAILSLURP_API_KEY`, `DEBOUNCE_API_KEY`, and `ZAMMAD_TOKEN`.

Ask a teammate for them and put the values in your `.env`.

Also in your `.env` put the following values :

```dotenv
FEATURE_SEND_MAIL=True
```

### Load test fixtures in the database

Note that this will delete your database. Load the specific fixtures in the database:

```bash
ENABLE_DATABASE_DELETION=True npm run delete-database ; npx run-s "migrate up" "fixtures:load-ci cypress/e2e/redirect_after_session_expiration/fixtures.sql" "update-organization-info 2000"
```

### Start ProConnect Identité with the test configuration

Then run the app with the specific env vars:

```bash
npx dotenvx run -f cypress/e2e/redirect_after_session_expiration/env.conf -- npm run dev
```

## Run Cypress

On your host, run the tests

```bash
npx dotenvx run -- npx cypress run --headed --spec "cypress/e2e/redirect_after_session_expiration/index.cy.ts"
```

## About test client used in e2e test

Some tests require a test client to be running.
By default, the Docker Compose file is configured to launch enough test clients to execute the end-to-end (E2E) tests.
