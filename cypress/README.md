# Run cypress locally

## Setup env vars

You will need to set `SENDINBLUE_API_KEY`, `ZAMMAD_URL` and `ZAMMAD_TOKEN`.

Ask a teammate for them and put the values in your `.env`.

Also in your .env put the following values :

```dotenv
DO_NOT_SEND_MAIL=False
DO_NOT_RATE_LIMIT=True
```

## Load test fixtures in database

Note that this will delete your database. Load the specific fixtures in database:

```bash
ENABLE_DATABASE_DELETION=True npx run-s delete-database "fixtures:load-ci cypress/fixtures/join_with_sponsorship.sql" "update-organization-info 2000"
```

## Start MonComptePro with the test configuration

Then run the app with the specific env vars:

```bash
env $(grep -v '^#' cypress/env/join_with_sponsorship.conf | xargs) npm run dev
```

## Run Cypress

On your host, install cypress:

```bash
npm -g install cypress@12.17.1
npm -g install cypress-mailslurp@1
```

On your host, run the tests

```bash
export CYPRESS_MAILSLURP_API_KEY=xxx
export CYPRESS_MONCOMPTEPRO_HOST=http://localhost:3000
cypress open
```
