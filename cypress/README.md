# Run cypress locally

In the MonComptePro virtual machine, set up the test database:

```bash
sudo su - postgres
psql -c 'DROP DATABASE IF EXISTS "api-auth-test";'
psql -c ' CREATE DATABASE "api-auth-test" WITH OWNER "api-auth";'
exit
sudo su - api-auth
cd /opt/apps/api-auth/current
export $(cat /etc/api-auth.conf | xargs)
export DATABASE_URL=postgres://api-auth:api-auth@localhost:5432/api-auth-test
export PGDATABASE=api-auth-test
npm run migrate up
exit
```

In the MonComptePro virtual machine, run the app on the test database:

```bash
sudo systemctl stop api-auth
sudo su - api-auth
cd /opt/apps/api-auth/current
export $(cat /etc/api-auth.conf | xargs)
export DO_NOT_RATE_LIMIT=True
export DO_NOT_USE_ANNUAIRE_EMAILS=True
export TEST_CONTACT_EMAIL=34c5063f-81c0-4d09-9d0b-a7502f844cdf@mailslurp.com
export DATABASE_URL=postgres://api-auth:api-auth@127.0.0.1:5432/api-auth-test

export DO_NOT_SEND_MAIL=False
export SENDINBLUE_API_KEY="xxx"
npm run build && npm run start
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

```bash
export PGDATABASE=api-auth-test
export DATABASE_URL=postgres://api-auth:api-auth@127.0.0.1:5432/api-auth-test
npm run delete-database
npm run load-ci-fixtures scripts/fixtures/join_collectivite_territoriale.sql
npm run update-organization-info 2000
```
reset user table

```bash
sudo su - api-auth
cd /opt/apps/api-auth/current
export $(cat /etc/api-auth.conf | xargs)
psql -d api-auth-test -c 'DELETE FROM users;' && psql -d api-auth-test -f scripts/fixtures.sql
exit
```
