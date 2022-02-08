# Comptes api.gouv.fr

Fédérateur d’identité personne morale utilisée sur :

- DataPass : http://datapass.api.gouv.fr
- L’API Manager API Particulier : https://mon.portail.api.gouv.fr/
- L’API Manager API Entreprise : https://dashboard.entreprise.api.gouv.fr/login

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

#### Dependencies setup

- [Ansible 2.9.10](https://www.ansible.com/)
- [VirtualBox \^5.2.10](https://www.virtualbox.org)
- [Vagrant \^2.1.1](https://www.vagrantup.com)
- NFS v4

#### Local environment

Clone the repo:

```bash
git clone git@github.com:betagouv/api-auth.git
```

Add the following hosts in `/etc/hosts`:

```text
192.168.56.127 auth-development.infra.api.gouv.fr
192.168.56.127 auth-development.api.gouv.fr
```

Then create and configure your virtual machine:

```bash
vagrant up
```

> **If you are using macOS.**
> The host's `/etc/hosts` configuration file may not take effect in the guest machines.
> You might need to also alter the guest machine's `/etc/hosts` after running vagrant up.
> Connect to each guest machine

```bash
vagrant ssh
```

> And copy your hosts to `/etc/hosts`

> **If you are using macOS Catalina 10.15**
> Vagrant encounters the following error :
> `NFS is reporting that your exports file is invalid`
> You must change your source folder in your Vagrantfile as described [here](https://github.com/hashicorp/vagrant/issues/10961#issuecomment-538906659)

#### Interactive mode

```bash
vagrant ssh
sudo systemctl stop api-auth
sudo su - api-auth
cd /opt/apps/api-auth/current
export $(cat /etc/api-auth.conf | xargs)
npm start
```

Optional, you can also run api-auth in debug mode:

```
DEBUG=oidc-provider:* npm start
```

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
