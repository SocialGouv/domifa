# Mise en prod

## Versions

Version majeure actuelle: 1.x

Pour chaque sprint, création d'une version mineure, par exemple 1.17.0 pour le sprint 17.

Pour les tests avant mise en prod, créer un tag 1.17.0-rc1 (puis rc2...) et déployer ce tag sur l'environnement de préprod.

## Déploiement manuel

__NOTE__: ceci permet de déployer la dernière version uniquement

__TODO__: permettre de déployer une version en particulier

Sur le serveur:

```bash
cd /home/factory/master/
# récupération de la dernière version du fichier docker-compose
git pull
# récupération de la dernière image
sudo docker pull registry.gitlab.factory.social.gouv.fr/socialgouv/domifa/backend:master && sudo docker pull registry.gitlab.factory.social.gouv.fr/socialgouv/domifa/frontend:master
# déploiement
sudo docker-compose -f docker-compose.prod.yml up --build -d --remove-orphans
# check des logs
sudo docker logs --tail 200 -f master_backend_1
# nettoyage des anciennes images
sudo docker image prune --all
```
