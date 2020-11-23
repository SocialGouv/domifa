#!/bin/bash

# AVANT DE LANCER POUR LA PREMIRE FOIS, NETTOYER LES ANCIENS CONTAINERS:
# APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml down
# APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml rm
# docker volume rm $(docker volume ls -f dangling=true -q | grep domifa)

PURGE="true" # NOTE: décommenter pour purger complètement l'environnement, y compris tous les volumes "*domifa*" contenant les données!
if [ "${PURGE}" == "true" ]; then
  # stop and remove mongo+postgres
  APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml down
  APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml rm
  docker volume rm $(docker volume ls -f dangling=true -q | grep domifa)
fi

echo ""
echo "###########################################"
echo "# START DOCKER ENV..."
echo "#"
echo ""
# start mongo+postgres (with initial dumps)
APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml up --build --detach --force-recreate

docker ps -a

echo ""
echo "###########################################"
echo "# TO RUN BACKEND:"
echo ""
echo "# enter container"
echo "docker exec -it domifa-backend-dev bash"
echo ""
echo "# start app"
echo "yarn start"
echo ""

echo ""
echo "###########################################"
echo "# TO RUN FRONTEND:"
echo ""
echo "# enter container"
echo "docker exec -it domifa-frontend-dev bash"
echo ""
echo "# start app"
echo "yarn start"
echo ""