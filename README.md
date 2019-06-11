# API Auth

Plateforme d'authentification unique à destination des services api.gouv.fr (https://signup.api.gouv.fr, https://particulier.api.gouv.fr/admin, ...).

## How to run api-auth

API Auth is part of the Signup ecosystem.

The instructions to install the whole Signup ecosystem is available on a [private gitlab](https://gitlab.incubateur.net/beta.gouv.fr/signup-ansible).

## Migrations

Migration are managed by [node-pg-migrate](https://www.npmjs.com/package/node-pg-migrate).

To create a migration run:

```
npm run migrate create "add names to user"
```

To run the migration run:

```
npm run migrate up
```

More info available at [https://github.com/salsita/node-pg-migrate](https://github.com/salsita/node-pg-migrate).

## Add a user to an organisation

Connect to api-auth database then:

```postgresql
SELECT * FROM users
INNER JOIN users_organizations AS uo ON uo.user_id = users.id
INNER JOIN organizations AS o ON uo.organization_id = o.id
WHERE o.siret = '<siret>';
```

```postgresql
SELECT * FROM users WHERE email = '<email>';
INSERT INTO users_organizations ( user_id, organization_id ) VALUES('<user_id>', '<organization_id>');
```

Send the following mail to the current users of the organization:

```
Subject: Votre organisation sur api.gouv.fr

Bonjour,

<given_name> <family_name> a rejoint l'organisation <nom_raison_sociale> sur https://signup.api.gouv.fr.

Cordialement,

Raphaël Dubigny,
Équipe api.gouv.fr
```
