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
echo "# $0 --db=dev --dump=test"
echo "#"
echo "##############################################################################################"

for i in "$@"
do
case $i in
    --db=*)
      TARGET_DB_ENV="${i#*=}"
    ;;
    --dump=*)
      DUMP_ENV="${i#*=}"
    ;;
    --data-only=*)
      DATA_ONLY="${i#*=}"
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

if [ -z "${TARGET_DB_ENV}" ] 
then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] PARAMETER --db=dev|test IS MISSING!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

if [ -z "${DUMP_ENV}" ] 
then
  DUMP_ENV="${TARGET_DB_ENV}"
fi

POSTGRES_CONTAINER_NAME=domifa-postgres

echo ""
echo "##############################################################################################"
echo "# Restore POSTGRES from dumps '${DUMP_ENV}' to databases '${TARGET_DB_ENV}'..."
echo "##############################################################################################"
echo ""

POSTGRES_DATABASE="domifa_${TARGET_DB_ENV}"

if [ -z "$POSTGRES_DATABASE" ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] env.POSTGRES_DATABASE not set"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "----------------------------------------------------------------------------------------------"
echo "[INFO] INITIALIZE POSTGRES DB '$POSTGRES_DATABASE' from '$POSTGRES_DUMP_PATH'..."
echo "----------------------------------------------------------------------------------------------"
echo ""

if [ -z "${POSTGRES_DUMP_PATH}" ]; then
  POSTGRES_DUMP_PATH="/app/_scripts/db/dumps/domifa_$DUMP_ENV.postgres.data-only.sql"
fi

(set -x && docker exec ${POSTGRES_CONTAINER_NAME} bash -c "psql --username=\${POSTGRES_USERNAME} --dbname=${POSTGRES_DATABASE} --file=${POSTGRES_DUMP_PATH}" )

if [ $? -ne 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT on container '${POSTGRES_CONTAINER_NAME}'!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "##############################################################################################"
echo "# [SUCCESS] RESTORE POSTGRES DATABASES: DONE √"
echo "##############################################################################################"
echo ""
