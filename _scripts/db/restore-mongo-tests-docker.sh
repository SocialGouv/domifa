#!/bin/bash
env=$1

echo ""
echo "#############################################################################"
echo "# START RESET TRAVIS DB..."
echo "#############################################################################"
echo ""

docker exec domifa-mongo-dev bash -c "\
MONGO_AUTH=\"-u \${MONGO_INITDB_ROOT_USERNAME} -p \${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=admin\"; \
mongo domifa_tests \${MONGO_AUTH} --eval \"db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority' } } )\"; \
mongo domifa_tests \${MONGO_AUTH} --eval \"db.dropDatabase()\";
mongo domifa_tests \${MONGO_AUTH} --eval \"db.createUser({user:'test', pwd:'test', roles:[{role:'readWrite', db:'domifa_tests'}] });\";
mongorestore \${MONGO_AUTH} --gzip --archive=/app/dump_tests.mongo.gz
"

echo ""
echo "#############################################################################"
echo "# RESET DB DONE √"
echo "#############################################################################"
echo ""
