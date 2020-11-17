#!/bin/bash
POSTGRES_CONTAINER_NAME="$1"
if [ -z "${POSTGRES_CONTAINER_NAME}" ] 
then
  # default container name
  POSTGRES_CONTAINER_NAME=domifa-postgres-dev
fi
DB_NAME=domifa_tests
POSTGRES_DUMP_PATH=/app/_scripts/db/dump_tests.postgres.dump

echo ""
echo "#############################################################################"
echo "# DUMP POSTGRES DB '${DB_NAME}'..."
echo "#############################################################################"
echo ""

(set -x && docker exec ${POSTGRES_CONTAINER_NAME} bash -c "\
pg_dump --dbname=${DB_NAME} --username=\${POSTGRES_USER} --no-owner --format=tar --file=${POSTGRES_DUMP_PATH} \
 && ls -lah ${POSTGRES_DUMP_PATH} \
")
echo ""
echo "#############################################################################"
echo "# POSTGRES DB '${DB_NAME}' DUMP DONE √"
echo "#############################################################################"
echo ""
