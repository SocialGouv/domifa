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

## Déploiement manuel en prod ou pré-prod

Sur le serveur, mettre à jour les sources:

```bash
cd /home/factory/master/
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
sudo docker-compose -f docker-compose.prod.yml up --build -d --remove-orphans --force-recreate
# check des logs
sudo docker logs --tail 200 -f master_backend_1
# nettoyage des anciennes images
sudo docker image prune --all
```
