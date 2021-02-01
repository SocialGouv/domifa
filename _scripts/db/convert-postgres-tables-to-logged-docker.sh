#!/bin/bash

echo "##############################################################################################"
echo "#"
echo "# USAGE:"
echo "#"
echo "# $0 [--db=test]"
echo "#"
echo "##############################################################################################"

for i in "$@"
do
case $i in
    --db=*)
      TARGET_DB_ENV="${i#*=}"
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
  echo "[INFO] PARAMETER --db=dev|test NOT SET: default to 'test'"
  echo "----------------------------------------------------------------------------------------------"
  TARGET_DB_ENV=test
fi

POSTGRES_CONTAINER_NAME=domifa-postgres

(set -x && docker exec ${POSTGRES_CONTAINER_NAME} bash -c "/app/_scripts/db/convert-postgres-tables-to-logged.sh --db=${TARGET_DB_ENV}")

if [ $? -ne 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT on container '${POSTGRES_CONTAINER_NAME}'!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "##############################################################################################"
echo "# [SUCCESS] √"
echo "##############################################################################################"
echo ""
