# Run cypress locally

## Fast with a script

You can use `./scripts/test.sh` to run tests locally. Run it to get usage help. You can either let the script run cypress tests by itself, or just use it to quickly prepare your local env with test-specific env/fixtures and do manual tests.

The script will error out if it doesn’t find the necessary env vars. Ask a teammate for specific env vars and put the values in your `.env`.

:information_source: By default, the script runs the test node server on port 3002. This is done so that you can keep your default local dev instance up while running the tests.

## Step by step with command lines

### Setup env vars

You will need to set `BREVO_API_KEY`, `ZAMMAD_URL` and `ZAMMAD_TOKEN`.

Ask a teammate for them and put the values in your `.env`.

Also in your .env put the following values :

```dotenv
DO_NOT_SEND_MAIL=False
DO_NOT_RATE_LIMIT=True
```

### Load test fixtures in the database

Note that this will delete your database. Load the specific fixtures in the database:

```bash
ENABLE_DATABASE_DELETION=True npx run-s delete-database "fixtures:load-ci cypress/fixtures/redirect_after_session_expiration.sql" "update-organization-info 2000"
```

### Start MonComptePro with the test configuration

Then run the app with the specific env vars:

```bash
env $(grep -v '^#' cypress/env/redirect_after_session_expiration.conf | xargs) npm run dev
```

## Run Cypress

On your host, run the tests

```bash
export CYPRESS_MAILSLURP_API_KEY=ask_a_teammate
npx cypress run --headed --spec "cypress/e2e/redirect_after_session_expiration.cy.js"
```
