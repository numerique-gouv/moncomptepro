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

Je viens de lever le blocage vous concernant. Vous pouvez de nouveau soumettre une demande pour rejoindre l'organisation via le lien suivant : https://auth.api.gouv.fr/users/join-organization .

Suite à cela, vous serez en mesure de soumettre une demande d'habilitation FranceConnect via le lien suivant : https://signup.api.gouv.fr/franceconnect

Je reste à votre disposition pour toute information complémentaire.

Cordialement,

Équipe api.gouv.fr
```

## Add a non existing user to an organization on the production environment

```postgresql
INSERT INTO users (email, email_verified, encrypted_password, created_at, updated_at, given_name, family_name, roles)
VALUES
  (
  'EMAIL',
  'true',
  'not_set',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'GIVEN_NAME',
  'FAMILY_NAME',
  '{"TARGET_API","TARGET_API_2"}'
  )
RETURNING *;

INSERT INTO organizations (siret, authorized_email_domains)
VALUES
  (
  'SIRET',
  '{"MAIL_DOMAIN"}'
  )
RETURNING *;

INSERT INTO users_organizations (user_id, organization_id)
VALUES
  (
  USER_ID,
  ORGANIZATION_ID
  )
;
```

The send the following email:

```
Subject: Création de votre compte « Signup »
To: EMAIL
CC: signup@api.gouv.fr

Bonjour,

Votre compte « Signup » a été créé. Il vous permet d'administrer les demandes d'habilitation à l'TARGET_API via le lien : https://signup.api.gouv.fr.

Pour y avoir accès merci de définir votre mot de passe en remplissant le formulaire de mot de passe oublié : https://auth.api.gouv.fr/users/reset-password.

Nous restons à votre disposition pour tout complément d'information.

Cordialement,

Équipe api.gouv.fr
```
