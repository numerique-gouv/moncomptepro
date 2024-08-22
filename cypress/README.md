# Run cypress locally

## Step by step with command lines

### Setup env vars

You will need to set `BREVO_API_KEY`, `DEBOUNCE_API_KEY`, `ZAMMAD_URL` and `ZAMMAD_TOKEN`.

Ask a teammate for them and put the values in your `.env`.

Also in your .env put the following values :

```dotenv
DO_NOT_SEND_MAIL=False
DO_NOT_RATE_LIMIT=True
```

### Warm up the containers

```bash
$ docker compose --project-directory cypress/e2e/activate_totp up --build --detach
```

## Run Cypress

On your host, run the tests

```bash
export CYPRESS_MAILSLURP_API_KEY=ask_a_teammate
npx cypress run --headed --spec cypress/e2e/activate_totp/index.cy.ts
```

## About test client used in e2e test

Some tests require a test client to be running.
By default, the Docker Compose file is configured to launch enough test clients to execute the end-to-end (E2E) tests.
