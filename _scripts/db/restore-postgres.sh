#!/bin/sh

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
    --dump=*)
      DUMP_ENV="${i#*=}"
    ;;
    --recreate-db)
      RECREATE_DB="true"
    ;;
    --create-db)
      CREATE_DB="true"
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

if [ -z "$TARGET_DB_ENV" ] 
then
  # on first container startup: this script is called without arguments: initialize dev database from test dump
  TARGET_DB_ENV=dev 
fi

if [ -z "$DUMP_ENV" ] 
then
  # on first container startup: this script is called without arguments: initialize dev database from test dump
  DUMP_ENV=test
fi

POSTGRES_DUMP_PATH="./_scripts/db/dumps/domifa_$DUMP_ENV.postgres.dump"
POSTGRES_DATABASE="domifa_${TARGET_DB_ENV}"

if [ ! -f "$POSTGRES_DUMP_PATH" ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] '$POSTGRES_DUMP_PATH' does not exist"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

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

if [ "$RECREATE_DB" == "true" ]; then

    # terminate other connections
    (set -x && psql --username "${POSTGRES_USERNAME}" --dbname postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE  pid <> pg_backend_pid() AND datname = '${POSTGRES_DATABASE}'")
    if [ $? -ne 0 ]; then
      echo ""
      echo "----------------------------------------------------------------------------------------------"
      echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT!"
      echo "----------------------------------------------------------------------------------------------"
      exit 1
    fi

    # drop database (ignore error)
    (set -x && psql --username "${POSTGRES_USERNAME}" --dbname postgres -c "DROP DATABASE IF EXISTS ${POSTGRES_DATABASE}")
    if [ $? -ne 0 ]; then
      echo ""
      echo "----------------------------------------------------------------------------------------------"
      echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT!"
      echo "----------------------------------------------------------------------------------------------"
      exit 1
    fi

    # create database (NOTE: POSTGRES_USER is "postgres" super user, while POSTGRES_USERNAME is "domifa" db owner & user)
    (set -x && psql --username "${POSTGRES_USER}" --dbname postgres -c "CREATE DATABASE ${POSTGRES_DATABASE} WITH OWNER=${POSTGRES_USER}")
    if [ $? -ne 0 ]; then
      echo ""
      echo "----------------------------------------------------------------------------------------------"
      echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT!"
      echo "----------------------------------------------------------------------------------------------"
      exit 1
    fi

fi

if [ "$CREATE_DB" == "true" ]; then

    # create database (NOTE: POSTGRES_USER is "postgres" super user, while POSTGRES_USERNAME is "domifa" db owner & user)
    (set -x && psql -h postgres --username "${POSTGRES_USER}" --dbname postgres -c "CREATE DATABASE ${POSTGRES_DATABASE} WITH OWNER=${POSTGRES_USER}")
    if [ $? -ne 0 ]; then
      echo ""
      echo "----------------------------------------------------------------------------------------------"
      echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT!"
      echo "----------------------------------------------------------------------------------------------"
      exit 1
    fi

fi

export POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
(set -x && pg_restore -h postgres --username=${POSTGRES_USER} --clean  --no-owner --exit-on-error --verbose --dbname=${POSTGRES_DATABASE} ${POSTGRES_DUMP_PATH})

if [ $? -ne 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "##############################################################################################"
echo "# [SUCCESS] INITIALIZE POSTGRES DB '$POSTGRES_DATABASE': DONE √"
echo "##############################################################################################"
echo ""
