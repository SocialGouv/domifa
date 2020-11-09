#!/bin/bash

echo ""
echo "###########################################"
echo "# STOP DATABASES..."
echo "#"
echo ""
# stop and remove mongo+postgres
APP_DIR=$(pwd) docker-compose --project-name domifa-travis --env-file ./.env.test.travis -f ./docker-compose.travis.yml down
APP_DIR=$(pwd) docker-compose --project-name domifa-travis --env-file ./.env.test.travis -f ./docker-compose.travis.yml rm


echo ""
echo "###########################################"
echo "# START DATABASES..."
echo "#"
echo ""
# start mongo+postgres (with initial dumps)
APP_DIR=$(pwd) docker-compose --project-name domifa-travis --env-file ./.env.test.travis -f ./docker-compose.travis.yml up --build --detach --force-recreate

DB_TIMEOUT=5
start=`date +%s`

echo ""
echo "###########################################"
echo "# Wait for MONGO to be ready (timeout: ${DB_TIMEOUT}s)..."
echo "#"
echo ""

/usr/bin/docker inspect -f {{.State.Health.Status}} domifa-mongo-test
i=0
until [ $i -eq $DB_TIMEOUT ] || [ "$(/usr/bin/docker inspect -f {{.State.Health.Status}} domifa-mongo-test)" == "healthy" ]; do
    sleep 1
    i=$((i+1))
done;
/usr/bin/docker inspect -f {{.State.Health.Status}} domifa-mongo-test
end=`date +%s`
DURATION=$((end-start))
echo ""
echo "Mongo start duration: ${DURATION}s"

echo ""
echo "###########################################"
echo "# Wait for POSTGRES to be ready (timeout: ${DB_TIMEOUT}s)..."
echo "#"
echo ""

/usr/bin/docker inspect -f {{.State.Health.Status}} domifa-postgres-test
i=0
until [ $i -eq $DB_TIMEOUT ] || [ "$(/usr/bin/docker inspect -f {{.State.Health.Status}} domifa-mongo-test)" == "healthy" ]; do
    sleep 1
    i=$((i+1))
done;
/usr/bin/docker inspect -f {{.State.Health.Status}} domifa-postgres-test
end=`date +%s`
DURATION=$((end-start))
echo ""
echo "Postgres start duration: ${DURATION}s"

echo ""
echo "###########################################"
echo "# Container logs for 'domifa-postgres-test':"
echo "#"
echo ""
docker logs --tail 5 domifa-postgres-test

echo ""
echo "###########################################"
echo "# Container logs for 'domifa-mongo-test':"
echo "#"
echo ""
docker logs --tail 5 domifa-mongo-test

echo ""
echo "###########################################"
echo "# Container status:"
echo "#"
echo ""

docker ps -a