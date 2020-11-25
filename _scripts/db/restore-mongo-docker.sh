#!/bin/bash

for i in "$@"
do
case $i in
    --dump-path=*)
    MONGO_DUMP_PATH="${i#*=}"
    ;;
    *)
    --recreate-user)
    RECREATE_USER="true"
    ;;
    *)
    --mongo-container=*)
    MONGO_CONTAINER_NAME="${i#*=}"
    ;;
    *)
    # unknown option
    echo ""
    echo "[WARN] INVALID OPTION '${$i}'"
    echo ""
    ;;
esac
done

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
DB_USER=test
DB_PASS=test
DB_NAME=domifa_tests

if [ "RECREATE_USER" == "TRUE" ] 
then
  # do not recreate user
docker exec ${MONGO_CONTAINER_NAME} bash -c "\
MONGO_AUTH=\"-u \${MONGO_INITDB_ROOT_USERNAME} -p \${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=${DB_AUTH_SOURCE}\"; \
/docker-entrypoint-initdb.d/restore-mongo.sh
"
# mongo ${DB_NAME} \${MONGO_AUTH} --eval \"db.dropDatabase()\";
# mongorestore \${MONGO_AUTH} --gzip --archive=${MONGO_DUMP_PATH}
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
