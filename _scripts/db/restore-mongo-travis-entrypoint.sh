#!/bin/bash

echo ""
echo "#############################################################################"
echo "# RESTORE MONGO TRAVIS DB..."
echo "#############################################################################"
echo ""
mongo domifa_tests --eval "db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority' } } )"
# sleep 2
mongo domifa_tests --eval "db.dropDatabase()"
# sleep 2
# mongo domifa_tests --eval "use domifa_tests db.createUser({user:'test', pwd:'test', roles:[{role:'readWrite', db:'domifa_tests'}] });"
mongo domifa_tests --eval "db.createUser({user:'test', pwd:'test', roles:[{role:'readWrite', db:'domifa_tests'}] });"
# sleep 2
mongorestore --gzip --archive=/app/_scripts/db/dump_tests.mongo.gz
# sleep 2

echo ""
echo "#############################################################################"
echo "# RESET MONGO TRAVIS DB DONE √"
echo "#############################################################################"
echo ""
