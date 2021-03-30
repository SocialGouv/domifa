# Mise en prod

## Versions

Version majeure actuelle: 1.x

Pour chaque sprint, création d'une version mineure, par exemple 1.17.0 pour le sprint 17.

Pour les tests avant mise en prod, créer un tag 1.17.0-rc1 (puis rc2...) et déployer ce tag sur l'environnement de préprod.

## Install

Pré-requis:

- git
- docker
- docker-compose

## Déploiement semi-automatique

```bash
cd /home/factory/domifa/

./deploy.sh master # deploy master branch
./deploy.sh 1.1.0 # deploy tag 1.1.0
```

## Déploiement manuel en prod ou pré-prod

Sur le serveur, mettre à jour les sources:

```bash
cd /home/factory/domifa/
# vérifier la branche actuelle
git branch
# si besoin, changer de branche
git checkout 1.17.0
git checkout master
# mise à jour de la branche
git pull
```

Ensuite, éditer le fichier `.env`, et indiquer la branche ou le tag à déployer. Exemple:

```bash
DOMIFA_DOCKER_IMAGE_VERSION=1.17.0 # pour un tag
DOMIFA_DOCKER_IMAGE_VERSION=master # pour la branche 'master'
```

Si il s'agit d'une branche que l'on a déjà déployé (par exemple `master`), récupération de la dernière version des images:

```bash
DOMIFA_DOCKER_IMAGE_VERSION=1.17.0 # pour un tag
DOMIFA_DOCKER_IMAGE_VERSION=master # pour la branche 'master'
sudo docker pull registry.gitlab.factory.social.gouv.fr/socialgouv/domifa/backend:${DOMIFA_DOCKER_IMAGE_VERSION}
sudo docker pull registry.gitlab.factory.social.gouv.fr/socialgouv/domifa/frontend:${DOMIFA_DOCKER_IMAGE_VERSION}
```

Enfin, déployer:

```bash
# déploiement
sudo docker-compose --project-name master -f docker-compose.prod.yml up --build -d --remove-orphans --force-recreate
# check des logs
sudo docker logs --tail 200 -f master_backend_1
# nettoyage des anciennes images
sudo docker image prune --all
```

## Migrations

Les migrations sont exécutées automatiquement au démarrage.

Pour faire un rollback d'une migration, ou relancer une migration:

```bash
# enter container
sudo docker exec -it master_backend_1 bash
# migrate DOWN (-1)
yarn run db:prod:migrate-down:last
# migrate UP (all)
yarn run db:prod:migrate-up
```

## Docker build

```sh
$ yarn
$ yarn build
#
$ docker build --shm-size 512M -f packages/backend/Dockerfile -t socialgouv/domifa/backend .
$ docker build -f packages/frontend/Dockerfile -t socialgouv/domifa/frontend .
#
#
# Tested with
$ docker run --rm -p 3000:3000 socialgouv/domifa/backend
$ docker run --rm --env DOMIFA_BACKEND_URL=https://domifa-api.fabrique.social.gouv.fr/ --env PORT=4200 -p 4200:4200 socialgouv/domifa/frontend
```
