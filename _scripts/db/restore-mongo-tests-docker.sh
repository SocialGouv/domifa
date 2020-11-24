#!/bin/bash
MONGO_CONTAINER_NAME="$1"
if [ -z "${MONGO_CONTAINER_NAME}" ] 
then
  # default container name
  MONGO_CONTAINER_NAME=domifa-mongo-dev
fi

echo ""
echo "#############################################################################"
echo "# RESTORE MONGO DB on container ${MONGO_CONTAINER_NAME}..."
echo "#############################################################################"
echo ""

DB_AUTH_SOURCE=admin
MONGO_DUMP_PATH=/app/_scripts/db/dump_tests.mongo.gz
DB_USER=test
DB_PASS=test
DB_NAME=domifa_tests

if [ "${2}" = "--keep-user" ] 
then
  # do not recreate user
docker exec ${MONGO_CONTAINER_NAME} bash -c "\
MONGO_AUTH=\"-u \${MONGO_INITDB_ROOT_USERNAME} -p \${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=${DB_AUTH_SOURCE}\"; \
mongo ${DB_NAME} \${MONGO_AUTH} --eval \"db.dropDatabase()\";
mongorestore \${MONGO_AUTH} --gzip --archive=${MONGO_DUMP_PATH}
"
else
docker exec ${MONGO_CONTAINER_NAME} bash -c "\
MONGO_AUTH=\"-u \${MONGO_INITDB_ROOT_USERNAME} -p \${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=${DB_AUTH_SOURCE}\"; \
mongo ${DB_NAME} \${MONGO_AUTH} --eval \"db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority' } } )\"; \
mongo ${DB_NAME} \${MONGO_AUTH} --eval \"db.dropDatabase()\";
mongo ${DB_NAME} \${MONGO_AUTH} --eval \"db.createUser({user:'${DB_USER}', pwd:'test', roles:[{role:'readWrite', db:'${DB_NAME}'}] });\";
mongorestore \${MONGO_AUTH} --gzip --archive=${MONGO_DUMP_PATH}
"
fi

echo ""
echo "#############################################################################"
echo "# RESET MONGO DB DONE on container ${MONGO_CONTAINER_NAME} √"
echo "#############################################################################"
echo ""
