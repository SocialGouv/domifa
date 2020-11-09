#!/bin/bash
env=$1

PG_CONTAINER_NAME="$1"
if [ -z "${PG_CONTAINER_NAME}" ] 
then
  # default container name
  PG_CONTAINER_NAME=domifa-postgres-dev
  # NOTE: si ce script est lancé dans le container de dev, alors les variables pointent sur la base de dev au lieu de test, donc il faut les surcharger ici
  POSTGRES_DATABASE=domifa_tests
  POSTGRES_USERNAME=domifa_tests
  POSTGRES_PASSWORD=BfYK51e6RUmyZnSgsL9BAQgu6f6ciKgTFB68
fi


echo ""
echo "#############################################################################"
echo "# RESTORE POSTGRES DB on container ${PG_CONTAINER_NAME}..."
echo "#############################################################################"
echo ""

# terminate other connections
SQL="psql --username \"domifa_tests\" --dbname postgres -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE  pid <> pg_backend_pid() AND datname = 'domifa_tests'\""
(set -x && docker exec -it ${PG_CONTAINER_NAME} bash -c "$SQL")

# drop database (ignore error)
SQL="psql --username \"domifa_tests\" --dbname postgres -c \"DROP DATABASE domifa_tests\""
(set -x && docker exec -it ${PG_CONTAINER_NAME} bash -c "$SQL")

# create database
SQL="psql --username \"\$POSTGRES_USER\" --dbname postgres -c \"CREATE DATABASE domifa_tests WITH OWNER=domifa_tests\""
(set -x && docker exec -it ${PG_CONTAINER_NAME} bash -c "$SQL")

docker exec ${PG_CONTAINER_NAME} bash -c " \
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
pg_restore --username=domifa_tests --no-owner --role=domifa_tests --exit-on-error --verbose --dbname=domifa_tests /app/_scripts/db/dump_tests.postgres.dump \
"

echo ""
echo "#############################################################################"
echo "# RESET POSTGRES DB DONE on container ${PG_CONTAINER_NAME} √"
echo "#############################################################################"
echo ""