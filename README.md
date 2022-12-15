# 🔑 MonComptePro

![](https://i.imgur.com/0y7YKEk.png)

> MonComptePro identifie les personnes professionnelles du privé ou du public.

Plus concrètement, c'est une solution de connexion basée sur le standard OpenID Connect qui permet d'identifier un SIRET à une adresse email professionnelle. 

Actuellement, nous identifions les utilisateurs professionnels du privé ou du public sur les plateformes suivantes :
- DataPass : http://datapass.api.gouv.fr
- L’API Manager API Particulier : https://mon.portail.api.gouv.fr/
- L’API Manager API Entreprise : https://dashboard.entreprise.api.gouv.fr/
- HubEE : https://hubee.numerique.gouv.fr/
- catalogue.data.gouv : https://catalogue.data.gouv.fr/

## 🗺️ Tester le parcours

Pour tester le parcours de connexion complet, vous pouvez tester la connexion MonComptePro depuis le service DataPass qui intègre le bouton de connexion. Pour cela nous mettons à votre disposition une plateforme de démonstration appelée « staging ».

Cette plateforme est disponible via le lien suivant : https://datapass-staging.api.gouv.fr/api-entreprise.

Cette plateforme utilise de vraies données ouvertes pour les données des organisations. Elle n’est cependant connectée à aucun environment de production. Ainsi vous pouvez vous créer n’importe quel compte utilisateur en entrant n’importe quel numéro SIRET et en utilisant des emails jetables yopmail.

Vous pouvez également utiliser les comptes de tests suivants :

- utilisateur sans droits dans l’outil DataPass :
    - identifiant : user@yopmail.com
    - mot de passe : user@yopmail.com
- utilisateur avec des droits d’instructeur dans l’outil DataPass :
    - identifiant : api-particulier@yopmail.com
    - mot de passe : api-particulier@yopmail.com

À noter que les emails reçus sur les adresses en yopmail.com sont accessibles sur : http://yopmail.com/.

## 🖱️ Installer le bouton de connexion MonComptePro sur votre service en ligne

### Spécifications techniques

La connexion MonComptePro est basée sur le standard [OpenID Connect](https://openid.net/connect/) également utilisé par FranceConnect. Pour mettre en place la connexion MonComptePro, il vous faut donc installer sur votre service en ligne un module de connexion compatible OpenID Connect ou utiliser un des « clients » compatibles OpenID Connect. Vous trouverez une liste des clients compatibles sur le site openid.net : https://openid.net/developers/certified/

Afin de configurer votre module ou votre client OpenId Connect, vous trouverez ci-dessous les paramètres de configuration spécifiques à MonComptePro :
- paramètres de configuration de l’instance de test : https://app-test.moncomptepro.beta.gouv.fr/.well-known/openid-configuration
- paramètres de configuration de l’instance de production : https://app.moncomptepro.beta.gouv.fr/.well-known/openid-configuration
- exemple des données retournées par l’endpoint `GET /userinfo` du serveur OpenID :

```json
{
    "email": "user@red-needles-sarl.com",
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
        "label": "Red needles SARL",
        "is_external": "false"
    }],
    "sub": 154
}
```

> NB : `is_external` vaut `true` lorsque l’utilisateur est externe à l’organisation (ex : prestataire, sous-traitant, mandataire, etc.)

### Spécifications visuelles

À venir vendredi 16 décembre 2022.

### Installation en environnement de test

Afin d'effectuer les développements sur votre service en ligne, nous fournissons un environnement de test pour vous permettre d'effectuer des tests de bout en bout. Pour permettre la connexion avec MonComptePro, il faut enregistrer dans notre base de données les informations suivantes :

- la ou les URL de redirection : élément nécessaire au bon déroulement de la cinématique OpenId Connect
- client id & client secret : nous vous fournirons le couple client id & client secret de production, vous pouvez définir vous-même le couple à utiliser dans l'environnement de test.
- optionnellement, une ou plusieurs URL de redirection post logout : pour permettre à vos usagers de se déconnecter de votre plateforme.

Vous pouvez nous soumettre l'ensemble de ces informations par mail à contact@moncomptepro.beta.gouv.fr ou directement en nous soumettant une [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) en ligne sur le fichier suivant : https://github.com/betagouv/moncomptepro/blob/master/scripts/fixtures.sql#L232-L238

### Installation en environnement de production

Une fois la connexion MonComptePro fonctionnelle en environnement de test, nous vous fournirons les secrets de production par voie sécurisée afin de déployer le bouton sur votre service en ligne en production.

## 👋 Contribuer à MonComptePro

Nous ne fournissons pas encore de documentation d'installation pour les contributions externes.

Les instructions d’installation se trouvent ici (lien privé, disponible uniquement à notre équipe en interne) : https://gitlab.com/etalab/api.gouv.fr/moncomptepro-infrastructure
