#!/bin/bash

echo ""
echo "#############################################################################"
echo "# RESTORE MONGO TRAVIS DB..."
echo "#############################################################################"
echo ""

DB_USER=test
DB_PASS=test
DB_NAME=domifa_tests
MONGO_DUMP_PATH=/app/_scripts/db/dump_tests.mongo.gz

mongo domifa_tests --eval "db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority' } } )"
# sleep 2
mongo domifa_tests --eval "db.dropDatabase()"
# sleep 2
mongo domifa_tests --eval "db.createUser({user:'${DB_USER}', pwd:'${DB_PASS}', roles:[{role:'readWrite', db:'${DB_NAME}'}] });"
# sleep 2
mongorestore --gzip --archive=${MONGO_DUMP_PATH}
# sleep 2

echo ""
echo "#############################################################################"
echo "# RESET MONGO TRAVIS DB DONE √"
echo "#############################################################################"
echo ""
