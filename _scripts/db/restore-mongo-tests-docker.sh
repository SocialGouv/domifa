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


if [ "${2}" = "--keep-user" ]
then
  # do not recreate user
docker exec ${MONGO_CONTAINER_NAME} bash -c "\
MONGO_AUTH=\"-u \${MONGO_INITDB_ROOT_USERNAME} -p \${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=admin\"; \
mongo domifa_tests \${MONGO_AUTH} --eval \"db.dropDatabase()\";
mongorestore \${MONGO_AUTH} --gzip --archive=/app/_scripts/db/dump_tests.mongo.gz
"
else
docker exec ${MONGO_CONTAINER_NAME} bash -c "\
MONGO_AUTH=\"-u \${MONGO_INITDB_ROOT_USERNAME} -p \${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=admin\"; \
mongo domifa_tests \${MONGO_AUTH} --eval \"db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority' } } )\"; \
mongo domifa_tests \${MONGO_AUTH} --eval \"db.dropDatabase()\";
mongo domifa_tests \${MONGO_AUTH} --eval \"db.createUser({user:'test', pwd:'test', roles:[{role:'readWrite', db:'domifa_tests'}] });\";
mongorestore \${MONGO_AUTH} --gzip --archive=/app/_scripts/db/dump_tests.mongo.gz
"
fi

echo ""
echo "#############################################################################"
echo "# RESET MONGO DB DONE on container ${MONGO_CONTAINER_NAME} √"
echo "#############################################################################"
echo ""
