#!/bin/bash

DANGER_REMOVE_CONTAINERS="false"
DANGER_DROP_VOLUMES="false"

for i in "$@"
do
case $i in
    --stop)
      STOP_CONTAINERS="true"
    ;;
    --remove-domifa-containers)
      STOP_CONTAINERS="true"
      REMOVE_CONTAINERS="true"
    ;;
    --drop-domifa-volumes)
      STOP_CONTAINERS="true"
      REMOVE_CONTAINERS="true"
      DANGER_DROP_VOLUMES="true"
    ;;
    --with-dev-containers)
      WITH_DEV_CONTAINERS="true"
    ;;
    *)
    # unknown option
    echo ""
    echo "----------------------------------------------------------------------------------------------"
    echo "[WARN] INVALID OPTION '$i': ignore"
    echo "----------------------------------------------------------------------------------------------"
    echo ""
    ;;
esac
done

echo "WITH_DEV_CONTAINERS: $WITH_DEV_CONTAINERS"

if [ "$STOP_CONTAINERS" == "true" ]; then
  echo "###########################################"
  echo "# [WARN] STOP domifa containers"
  echo "###########################################"
  # stop all domifa containers
  (set -x && APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml down)
  if [ "$REMOVE_CONTAINERS" == "true" ]; then
    echo "###########################################"
    echo "# [WARN] REMOVE domifa containers"
    echo "###########################################"
    # remove all domifa containers
    (set -x && APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml rm)
    
    if [ "$DANGER_DROP_VOLUMES" == "true" ]; then
      echo "###########################################"
      echo "# [DANGER] DROP domifa volumes"
      echo "###########################################"
      read -r -p "All 'domifa' volumes data WILL BE LOST. Are you sure? [y/N] " response
      case "$response" in
          [yY][eE][sS]|[yY])
            # DANGER!!! purge all domifa volumes
            (set -x && docker volume rm $(docker volume ls -f dangling=true -q | grep domifa))
          ;;
        *)
              echo "# [SKIP]"
              ;;
      esac
    fi
    
  fi
  exit 0
fi

echo ""
echo "###########################################"
echo "# START DOCKER ENV..."
echo "#"
echo ""

if [ "$WITH_DEV_CONTAINERS" == "true" ]; then
  echo "###########################################"
  echo "# [INFO] START domifa containers: postgres + backend + frontend"
  echo "###########################################"
  # start backend + frontend + postgres (with initial dumps)
  (set -x && APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml up --build --detach --force-recreate)
else
  echo "###########################################"
  echo "# [INFO] START domifa containers: postgres (only)"
  echo "###########################################"
  # start postgres only (with initial dumps)
  (set -x && APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml up --build --detach --force-recreate postgres)
fi

(set -x && docker ps -a)

echo ""
echo "###########################################"
echo "# TO RUN BACKEND:"
echo ""
echo "docker exec -it domifa-backend bash"
echo "yarn start # packages/backend"
echo ""

echo ""
echo "###########################################"
echo "# TO RUN FRONTEND:"
echo ""
echo "docker exec -it domifa-frontend bash"
echo "yarn start # packages/frontend"
echo ""
