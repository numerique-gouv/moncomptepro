# API Auth

Plateforme d'authentification unique à destination des services api.gouv.fr (https://signup.api.gouv.fr, https://particulier.api.gouv.fr/admin, ...).

## How to run api-auth

API Auth is part of the Signup ecosystem.

The instructions to install the whole Signup ecosystem is available on a [private gitlab repository](https://gitlab.incubateur.net/beta.gouv.fr/signup-ansible).

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

## Add a user to an organisation on the production environment

If the given email address is not from a free mail provider or a disposable mail provider, add the email domain to the organization authorized domains.
To do so, connect to api-auth database then:

```postgresql
UPDATE organizations set authorized_email_domains = array_append(authorized_email_domains, '<email_domain>') where id='<organization_id>';
```

Then send back the following email:

```
Bonjour,

La procédure pour rejoindre une organisation est un processus encore en partie manuel sur https://signup.api.gouv.fr.

Je viens de lever le blocage vous concernant. Vous pouvez de nouveau soumettre une demande pour rejoindre l'organisation : https://auth.api.gouv.fr/users/join-organization .

Je reste à votre disposition pour toute information complémentaire.

Cordialement,

Équipe API Particulier
```
