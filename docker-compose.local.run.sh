#!/bin/bash

DANGER_REMOVE_CONTAINERS="false"
DANGER_DROP_VOLUMES="false"

for i in "$@"
do
case $i in
    --remove-domifa-containers)
      DANGER_REMOVE_CONTAINERS="true"
    ;;
    --drop-domifa-volumes)
      DANGER_DROP_VOLUMES="true"
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

if [ "$DANGER_REMOVE_CONTAINERS" == "true" ]; then
  echo "###########################################"
  echo "# [DANGER] remove domifa containers"
  echo "###########################################"
  # stop and remove all domifa containers
  (set -x && APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml down)
  (set -x && APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml rm)
fi
if [ "$DANGER_DROP_VOLUMES" == "true" ]; then
  echo "###########################################"
  echo "# [DANGER] remove domifa volumes"
  echo "###########################################"
  # DANGER!!! purge all domifa volumes
  (set -x && docker volume rm $(docker volume ls -f dangling=true -q | grep domifa))
fi

echo ""
echo "###########################################"
echo "# START DOCKER ENV..."
echo "#"
echo ""
# start mongo+postgres (with initial dumps)
(set -x && APP_DIR=$(pwd) docker-compose --project-name domifa --env-file ./.env -f ./docker-compose.local.yml up --build --detach --force-recreate)

(set -x && docker ps -a)

echo ""
echo "###########################################"
echo "# TO RUN BACKEND:"
echo ""
echo "# enter container"
echo "docker exec -it domifa-backend bash"
echo ""
echo "# start app"
echo "yarn start"
echo ""

echo ""
echo "###########################################"
echo "# TO RUN FRONTEND:"
echo ""
echo "# enter container"
echo "docker exec -it domifa-frontend bash"
echo ""
echo "# start app"
echo "yarn start"
echo ""
