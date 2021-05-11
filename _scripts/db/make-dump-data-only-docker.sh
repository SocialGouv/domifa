#!/bin/bash

echo "##############################################################################################"
echo "#"
echo "# USAGE:"
echo "#"
echo "# $0 --db=dev [--dump=test]"
echo "#"
echo "# EXAMPLES:"
echo "#"
echo "# $0 --db=dev"
echo "# $0 --db=test"
echo "# $0 --db=dev --dump=test" # dump 'dev' database to 'test' dump file
echo "#"
echo "##############################################################################################"

for i in "$@"
do
case $i in
    --db=*)
      SOURCE_DB_ENV="${i#*=}"
    ;;
    --dump=*)
      DUMP_ENV="${i#*=}"
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

if [ -z "${SOURCE_DB_ENV}" ] 
then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] PARAMETER --db=dev|test IS MISSING!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

if [ -z "${DUMP_ENV}" ] 
then
  DUMP_ENV=${SOURCE_DB_ENV}
fi

POSTGRES_CONTAINER_NAME=domifa-postgres
POSTGRES_DUMP_PATH="/app/_scripts/db/dumps/domifa_$DUMP_ENV.postgres.data-only.sql"
POSTGRES_DUMP_FROM_DATABASE="domifa_${SOURCE_DB_ENV}" # nom de la base d'origine

echo ""
echo "##############################################################################################"
echo "[INFO] CREATE POSTGRES DB DUMP FROM '$POSTGRES_DUMP_FROM_DATABASE' to '$POSTGRES_DUMP_PATH'..."
echo "##############################################################################################"
echo ""

(set -x && docker exec ${POSTGRES_CONTAINER_NAME} bash -c "\
(set -x && pg_dump --dbname=${POSTGRES_DUMP_FROM_DATABASE} --username=\${POSTGRES_USER} --data-only --no-owner --format=plain --exclude-table=migrations --exclude-table=migrations_id_seq --file=${POSTGRES_DUMP_PATH}) \
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
