#!/bin/bash

# Vérifier qu'un paramètre est fourni
if [ $# -eq 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] PARAMETER 'test' IS MISSING!"
  echo "----------------------------------------------------------------------------------------------"
  echo "Usage: $0 test"
  exit 1
fi

# Vérifier que le paramètre est "test"
if [ "$1" != "test" ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] INVALID PARAMETER '$1'. Only 'test' is supported!"
  echo "----------------------------------------------------------------------------------------------"
  echo "Usage: $0 test"
  exit 1
fi

SOURCE_DB_ENV="test"
DUMP_ENV="test"

POSTGRES_CONTAINER_NAME=domifa-postgres
POSTGRES_DUMP_PATH="/app/_scripts/db/dumps/domifa_$DUMP_ENV.postgres.custom.gz"
POSTGRES_DUMP_FROM_DATABASE="domifa_${SOURCE_DB_ENV}" # nom de la base d'origine

echo ""
echo "##############################################################################################"
echo "[INFO] CREATE POSTGRES DB DUMP FROM '$POSTGRES_DUMP_FROM_DATABASE' to '$POSTGRES_DUMP_PATH'..."
echo "##############################################################################################"
echo ""

(set -x && docker exec ${POSTGRES_CONTAINER_NAME} bash -c "\
(set -x && pg_dump --dbname=${POSTGRES_DUMP_FROM_DATABASE} --exclude-table-data='spatial_ref_sys'  --username=\${POSTGRES_USER} --no-owner --format=custom --compress=9 --file=${POSTGRES_DUMP_PATH}) \
 && ls -lah ${POSTGRES_DUMP_PATH} \
")

if [ $? -ne 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT on container '${POSTGRES_CONTAINER_NAME}'!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "##############################################################################################"
echo "# [SUCCESS] CREATE POSTGRES DB DUMP: DONE √"
echo "##############################################################################################"
echo ""
