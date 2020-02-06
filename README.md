# auth.api.gouv.fr

Plateforme d'authentification unique à destination des services api.gouv.fr (https://signup.api.gouv.fr, https://particulier.api.gouv.fr/admin, ...).

## Installation

Les instructions d'installation se trouve ici : https://github.com/betagouv/signup-ansible

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
