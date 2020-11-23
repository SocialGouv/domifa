#!/bin/bash
env=$1

PG_CONTAINER_NAME="$1"
if [ -z "${PG_CONTAINER_NAME}" ] 
then
  # default container name (when using test db in local dev mode)
  PG_CONTAINER_NAME=domifa-postgres-dev
  # NOTE: si ce script est lancé dans le container de dev, alors les variables pointent sur la base de dev au lieu de test, donc il faut les surcharger ici
  POSTGRES_DATABASE=domifa_tests
  POSTGRES_USERNAME=domifa_tests
  POSTGRES_PASSWORD=BfYK51e6RUmyZnSgsL9BAQgu6f6ciKgTFB68
fi

POSTGRES_DUMP_PATH=/app/_scripts/db/dumps/domifa_tests.postgres.dump

echo ""
echo "#############################################################################"
echo "# RESTORE POSTGRES DB on container ${PG_CONTAINER_NAME}..."
echo "#############################################################################"
echo ""

# terminate other connections
SQL="psql --username \"${POSTGRES_USERNAME}\" --dbname postgres -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE  pid <> pg_backend_pid() AND datname = '${POSTGRES_DATABASE}'\""
(set -x && docker exec -it ${PG_CONTAINER_NAME} bash -c "$SQL")

# drop database (ignore error)
SQL="psql --username \"${POSTGRES_USERNAME}\" --dbname postgres -c \"DROP DATABASE ${POSTGRES_DATABASE}\""
(set -x && docker exec -it ${PG_CONTAINER_NAME} bash -c "$SQL")

# create database (NOTE: POSTGRES_USER is "postgres" super user, while POSTGRES_USERNAME is "domifa" db owner & user)
SQL="psql --username \"\$POSTGRES_USER\" --dbname postgres -c \"CREATE DATABASE ${POSTGRES_DATABASE} WITH OWNER=${POSTGRES_DATABASE}\""
(set -x && docker exec -it ${PG_CONTAINER_NAME} bash -c "$SQL")

docker exec ${PG_CONTAINER_NAME} bash -c " \
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
pg_restore --username=${POSTGRES_USERNAME} --no-owner --role=${POSTGRES_USERNAME} --exit-on-error --verbose --dbname=${POSTGRES_DATABASE} ${POSTGRES_DUMP_PATH} \
"

echo ""
echo "#############################################################################"
echo "# RESET POSTGRES DB DONE on container ${PG_CONTAINER_NAME} √"
echo "#############################################################################"
echo ""