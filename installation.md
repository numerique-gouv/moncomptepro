# Installation locale de MonComptePro

Cette liste d'instruction a été testée sur Ubuntu 20.

## Configuration des bases de données

### Installation de Postgres

```shell
sudo apt update
sudo apt install postgresql
```

Sur Mac :

```
brew up
brew install postgresql
```

### Création de la base Postgres

Lancer l'invite de commande PostgreSQL :
```shell
sudo -u postgres psql
```

Sur mac : 

```shell
psql
```

Puis dans l'invite de commandes postgresql : 

```sql
create user moncomptepro with encrypted password 'moncomptepro';
create database moncomptepro owner moncomptepro;
grant all privileges on database moncomptepro to moncomptepro;
```

Quitter l'invite de commandes avec ctrl-D.

### Installation de Redis

```shell
sudo apt install redis
```

Sur mac : 

```
brew install redis
brew services start redis # pour lancer le serveur redis automatiquement au démarrage
```

## Installation de l'application

### Installation de nodeJS avec NVM

```shell
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

Sur Mac :

```
brew install nvm
```

Suivre les instructions en console puis :

```shell
nvm install 16
```

### Build du projet

Cloner le projet :

```shell
git clone https://github.com/betagouv/moncomptepro.git
cd moncomptepro
```

Création du fichier de configuration.

Attention, il faut remplacer les identifiants de l'INSEE par vos propres identifiants. Pour créer un compte : https://api.gouv.fr/les-api/sirene_v3.

```shell
cat <<EOT >> moncomptepro.conf
NODE_ENV=production
PGUSER=moncomptepro
PGPASSWORD=moncomptepro
PGDATABASE=moncomptepro
PGPORT=5432
DATABASE_URL=postgres://moncomptepro:moncomptepro@127.0.0.1:5432/moncomptepro
SENDINBLUE_API_KEY=
MONCOMPTEPRO_HOST=http://localhost:3000
DO_NOT_SEND_MAIL=True
DO_NOT_CHECK_EMAIL_DELIVERABILITY=True
CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE=True
DO_NOT_USE_ANNUAIRE_EMAILS=True
SESSION_COOKIE_SECRET=moncompteprosecret
SENTRY_DSN=
SECURE_COOKIES="false"
INSEE_CONSUMER_KEY=yourownkey
INSEE_CONSUMER_SECRET=yourownsecret
EOT
```

Chargement des variables d'environnements :

```shell
export $(cat moncomptepro.conf | xargs)
```

Installation des dépendances :
```shell
npm i --dev
```

Migration de la base de donnée et chargement de données de tests :

```shell
npm run build
psql -h 127.0.0.1 -v ON_ERROR_STOP=1 -d moncomptepro -f scripts/fixtures.sql
npm run update-organization-info 2000
```

Lancement du projet en mode interactif :

```shell
npm run dev
```

## Tester l'application

L'application est maintenant disponible sur http://localhost:3000.

Pour se connecter, utiliser l'adresse mail user@yopmail.com et le mot de passe "user@yopmail.com".

Les mails ne sont pas envoyés mais imprimés en console.

## Tester la connexion avec un client de test

Vous pouvez utiliser le client de test suivant : https://hub.docker.com/r/beryju/oidc-test-client

Ce conteneur est instantiable via `docker`.

Vous pouvez utiliser la configuration `docker-compose` suivante :

```yaml
# docker-compose.yaml
version: '3.5'

services:
  oidc-test-client:
    image: ghcr.io/beryju/oidc-test-client
    ports:
      - 9009:9009
    environment:
      OIDC_CLIENT_ID: test-id
      OIDC_CLIENT_SECRET: test-secret
      OIDC_PROVIDER: https://app-development.moncomptepro.beta.gouv.fr
      OIDC_SCOPES: openid,email,organizations
      OIDC_DO_REFRESH: "false"
      OIDC_DO_INTROSPECTION: "false"
```

Vous pouvez lancer le conteneur avec `docker-compose up` dans le dossier du fichier `docker-compose.yaml`.
