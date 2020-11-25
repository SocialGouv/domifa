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
echo "# $0 --db=dev --dump=dev"
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

MONGO_CONTAINER_NAME=domifa-mongo
POSTGRES_CONTAINER_NAME=domifa-postgres

echo ""
echo "##############################################################################################"
echo "# Restore MONGO+POSTGRES from dumps '${DUMP_ENV}' to databases '${TARGET_DB_ENV}' on container '${MONGO_CONTAINER_NAME}'..."
echo "##############################################################################################"
echo ""

(set -x && docker exec ${MONGO_CONTAINER_NAME} bash -c "/docker-entrypoint-initdb.d/restore-mongo.sh --db=${TARGET_DB_ENV} --dump=${DUMP_ENV}")

if [ $? -ne 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT on container '${MONGO_CONTAINER_NAME}'!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

(set -x && docker exec ${POSTGRES_CONTAINER_NAME} bash -c "/docker-entrypoint-initdb.d/restore-postgres.sh --db=${TARGET_DB_ENV} --dump=${DUMP_ENV} --recreate-db")

if [ $? -ne 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT on container '${POSTGRES_CONTAINER_NAME}'!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "##############################################################################################"
echo "# [SUCCESS] RESTORE MONGO+POSTGRES DATABASES on container '${MONGO_CONTAINER_NAME}': DONE √"
echo "##############################################################################################"
echo ""
