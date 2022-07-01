# Comptes DataPass

Fédérateur d’identité personne morale utilisée sur :
- DataPass : http://datapass.api.gouv.fr
- L’API Manager API Particulier : https://mon.portail.api.gouv.fr/
- L’API Manager API Entreprise : https://dashboard.entreprise.api.gouv.fr/
- HubEE : https://hubee.numerique.gouv.fr/

## Détails techniques

- documentation officielle open id connect, e particulier sur le flow « Authorization Code » : https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
- paramètres de configuration de l’instance de staging : https://auth-staging.api.gouv.fr/.well-known/openid-configuration
- paramètres de configuration de l’instance de production : https://auth.api.gouv.fr/.well-known/openid-configuration
- exemple des données retournées par le serveur open id :

```
{
    "email": "user@monentreprise.com",
    "email_verified": true,
    "organizations":
    [{
        "id": 16,
        "siret": "21630215800011",
        "is_external": "true"
    }, {
        "id": 17,
        "siret": "21770138200012",
        "is_external": "false"
    }],
    "sub": 154,
    "updated_at": "2020-07-23T15:34:06.637Z"
}
```

> NB : `is_external` vaut `true` lorsque l’utilisateur est externe à l’organisation (ex : prestataire, sous-traitant, mandataire, etc.)

## Installation

Nous ne fournissons pas encore de documentation d'installation pour les contributions externes.

Les instructions d’installation se trouvent ici (lien privé, disponible uniquement à l'équipe interne) : https://gitlab.com/etalab/api.gouv.fr/api-auth-infrastructure

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
