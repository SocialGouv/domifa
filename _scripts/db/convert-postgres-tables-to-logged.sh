#!/bin/bash

# echo "##############################################################################################"
# echo "#"
# echo "# USAGE:"
# echo "#"
# echo "# $0 [--db=dev] [--dump=test] [--recreate-db]"
# echo "#"
# echo "##############################################################################################"

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

POSTGRES_CONTAINER_NAME=domifa-postgres

if [ -z "$TARGET_DB_ENV" ] 
then
  # on first container startup: this script is called without arguments: initialize dev database from test dump
  TARGET_DB_ENV=dev 
fi

POSTGRES_DATABASE="domifa_${TARGET_DB_ENV}"

if [ -z "$POSTGRES_USERNAME" ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] env.POSTGRES_USERNAME not set"
  echo "----------------------------------------------------------------------------------------------"
  echo ""
  exit 1
fi
if [ -z "$POSTGRES_PASSWORD" ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] env.POSTGRES_PASSWORD not set"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi
if [ -z "${POSTGRES_DATABASE}" ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] env.POSTGRES_USERNAME not set"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "----------------------------------------------------------------------------------------------"
echo "[INFO] CONVERT POSTGRES DB '${POSTGRES_DATABASE}' TABLES to 'LOGGED'..."
echo "----------------------------------------------------------------------------------------------"
echo ""

export POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
# convert all tables to unlogged for better performances in test environments: https://www.compose.com/articles/faster-performance-with-unlogged-tables-in-postgresql/
(set -x && for tbl in `psql --username "${POSTGRES_USERNAME}" --dbname "${POSTGRES_DATABASE}" -qAt -c "select tablename from pg_tables where schemaname = 'public';"` ; do  psql --username "${POSTGRES_USERNAME}" --dbname "${POSTGRES_DATABASE}" -c "alter table \"$tbl\" SET LOGGED" ; done;)

if [ $? -ne 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "##############################################################################################"
echo "# [SUCCESS] CONVERT POSTGRES DB '${POSTGRES_DATABASE}' TABLES to 'LOGGED': DONE √"
echo "##############################################################################################"
echo ""
