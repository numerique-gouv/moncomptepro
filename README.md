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
