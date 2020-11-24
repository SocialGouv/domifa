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

MONGO_CONTAINER_NAME=domifa-mongo
POSTGRES_CONTAINER_NAME=domifa-postgres
MONGO_DUMP_PATH="/app/_scripts/db/dumps/domifa_$DUMP_ENV.mongo.gz"
POSTGRES_DUMP_PATH="/app/_scripts/db/dumps/domifa_$DUMP_ENV.postgres.dump"
POSTGRES_DUMP_FROM_DATABASE="domifa_${SOURCE_DB_ENV}" # nom de la base d'origine

if [ "$DUMP_ENV" == "test" ]; then
  MONGO_DUMP_FROM_DATABASE="domifa_test" # nom de la base d'origine: test
else
  MONGO_DUMP_FROM_DATABASE="domifa" # nom de la base d'origine: preprod
fi

echo ""
echo "##############################################################################################"
echo "# Make dump MONGO+POSTGRES from dumps '${DUMP_ENV}' to databases '${SOURCE_DB_ENV}' on container '${MONGO_CONTAINER_NAME}'..."
echo "##############################################################################################"
echo ""

echo ""
echo "----------------------------------------------------------------------------------------------"
echo "[INFO] CREATE MONGO DB DUMP FROM '$MONGO_DUMP_FROM_DATABASE' to '$MONGO_DUMP_PATH'..."
echo "----------------------------------------------------------------------------------------------"
echo ""

(set -x && docker exec ${MONGO_CONTAINER_NAME} bash -c "\
MONGO_AUTH=\"-u \${MONGO_INITDB_ROOT_USERNAME} -p \${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=admin\"; \
(set -x && mongodump --verbose \${MONGO_AUTH} --db ${MONGO_DUMP_FROM_DATABASE} --gzip --archive=${MONGO_DUMP_PATH}) \
 && ls -lah ${MONGO_DUMP_PATH} \
")

if [ $? -ne 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT on container '${MONGO_CONTAINER_NAME}'!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "----------------------------------------------------------------------------------------------"
echo "[INFO] CREATE POSTGRES DB DUMP FROM '$POSTGRES_DUMP_FROM_DATABASE' to '$POSTGRES_DUMP_PATH'..."
echo "----------------------------------------------------------------------------------------------"
echo ""

(set -x && docker exec ${POSTGRES_CONTAINER_NAME} bash -c "\
(set -x && pg_dump --dbname=${POSTGRES_DUMP_FROM_DATABASE} --username=\${POSTGRES_USER} --no-owner --format=tar --file=${POSTGRES_DUMP_PATH}) \
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
echo "# [SUCCESS] MAKE DUMP MONGO+POSTGRES DATABASES on container '${MONGO_CONTAINER_NAME}': DONE √"
echo "##############################################################################################"
echo ""
