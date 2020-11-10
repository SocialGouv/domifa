#!/bin/bash
MONGO_CONTAINER_NAME="$1"
if [ -z "${MONGO_CONTAINER_NAME}" ] 
then
  # default container name
  MONGO_CONTAINER_NAME=domifa-mongo-dev
fi
DB_NAME=domifa_tests
MONGO_DUMP_PATH=/app/_scripts/db/dump_tests.mongo.gz

echo ""
echo "#############################################################################"
echo "# DUMP MONGO DB '${DB_NAME}'..."
echo "#############################################################################"
echo ""

(set -x && docker exec ${MONGO_CONTAINER_NAME} bash -c "\
MONGO_AUTH=\"-u \${MONGO_INITDB_ROOT_USERNAME} -p \${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=admin\"; \
mongodump \${MONGO_AUTH} -d ${DB_NAME} --gzip --archive=${MONGO_DUMP_PATH} \
 && ls -lah ${MONGO_DUMP_PATH} \
")

echo ""
echo "#############################################################################"
echo "# MONGO DB '${DB_NAME}' DUMP DONE √"
echo "#############################################################################"
echo ""
