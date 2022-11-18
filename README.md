# MonComptePro

Nous identifions les utilisateurs professionnels du privé ou du public sur les plateformes suivantes :
- DataPass : http://datapass.api.gouv.fr
- L’API Manager API Particulier : https://mon.portail.api.gouv.fr/
- L’API Manager API Entreprise : https://dashboard.entreprise.api.gouv.fr/
- HubEE : https://hubee.numerique.gouv.fr/

## Tester le parcours

Pour tester le parcours de connexion complet, vous pouvez tester la connexion MonComptePro depuis le service DataPass
qui intègre le bouton de connexion.
Pour cela nous mettons à votre disposition une plateforme de démonstration appelée « staging ».

Cette plateforme est disponible via le lien suivant : https://datapass-staging.api.gouv.fr/api-entreprise.

Cette plateforme utilise de vraies données ouvertes pour les données des organisations. Elle n’est cependant connectée à
aucun environment de production. Ainsi vous pouvez vous créer n’importe quel compte utilisateur en entrant n’importe
quel numéro SIRET et en utilisant des emails jetables yopmail.

Vous pouvez également utiliser les comptes de tests suivants :

- utilisateur sans droits dans l’outil DataPass :
    - identifiant : user@yopmail.com
    - mot de passe : user@yopmail.com
- utilisateur avec des droits d’instructeur dans l’outil DataPass :
    - identifiant : api-particulier@yopmail.com
    - mot de passe : api-particulier@yopmail.com

À noter que les emails reçus sur les adresses en yopmail.com sont accessibles sur : http://yopmail.com/.

## Détails techniques

- documentation officielle open id connect, en particulier sur le flow « Authorization Code » : https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
- paramètres de configuration de l’instance de staging : https://app-staging.moncomptepro.beta.gouv.fr/.well-known/openid-configuration
- paramètres de configuration de l’instance de production : https://app.moncomptepro.beta.gouv.fr/.well-known/openid-configuration
- exemple des données retournées par l’endpoint GET /userinfo du serveur open id :

```
{
    "email": "user@monentreprise.com",
    "email_verified": true,
    "organizations":
    [{
        "id": 16,
        "siret": "21630215800011",
        "label": "Commune de les martres sur morge - Mairie",
        "is_external": "true"
    }, {
        "id": 17,
        "siret": "83951732300011",
        "label": "Red needles",
        "is_external": "false"
    }],
    "sub": 154,
    "updated_at": "2020-07-23T15:34:06.637Z"
}
```

> NB : `is_external` vaut `true` lorsque l’utilisateur est externe à l’organisation (ex : prestataire, sous-traitant, mandataire, etc.)

## Installation

Nous ne fournissons pas encore de documentation d'installation pour les contributions externes.

Les instructions d’installation se trouvent ici (lien privé, disponible uniquement à l'équipe interne) : https://gitlab.com/etalab/api.gouv.fr/moncomptepro-infrastructure

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
