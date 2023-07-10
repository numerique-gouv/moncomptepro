# Run cypress locally

In the MonComptePro virtual machine, set up the test database:

```bash
sudo su - postgres
psql -c 'DROP DATABASE IF EXISTS "api-auth-test";'
psql -c ' CREATE DATABASE "api-auth-test" WITH OWNER "api-auth";'
exit
```

In the MonComptePro virtual machine, run the app on the test database:

```bash
sudo systemctl stop api-auth
sudo su - api-auth
cd /opt/apps/api-auth/current
export $(cat /etc/api-auth.conf | xargs)
export PGDATABASE=api-auth-test
export DATABASE_URL=postgres://api-auth:api-auth@127.0.0.1:5432/api-auth-test
export SENDINBLUE_API_KEY="xxx"
export MONCOMPTEPRO_HOST=https://app-development.moncomptepro.beta.gouv.fr
export DO_NOT_SEND_MAIL=False
export DO_NOT_VALIDATE_MAIL=True
export DO_NOT_RATE_LIMIT=True
export DO_NOT_USE_ANNUAIRE_EMAILS=True
export $(cat cypress/env/join_collectivite_territoriale_official_contact_email.conf) && npm run build && npm run start
```

In the MonComptePro virtual machine, load the fixtures in database:

```bash
sudo su - api-auth
cd /opt/apps/api-auth/current
export $(cat /etc/api-auth.conf | xargs)
export PGDATABASE=api-auth-test
export DATABASE_URL=postgres://api-auth:api-auth@127.0.0.1:5432/api-auth-test
npm run delete-database && npm run load-ci-fixtures cypress/fixtures/join_collectivite_territoriale_official_contact_email.sql && npm run update-organization-info 2000
```

On your host, install cypress:

```bash
npm -g install cypress@12
npm -g install cypress-mailslurp@1
```

On your host, run the tests

```bash
export CYPRESS_MAILSLURP_API_KEY=xxx
export CYPRESS_MONCOMPTEPRO_HOST=https://app-development.moncomptepro.beta.gouv.fr
cypress open
```
