#!/bin/bash
env=$1

echo ""
echo "#############################################################################"
echo "# START RESET TRAVIS DB..."
echo "#############################################################################"
echo ""

mongo domifa_tests --eval "db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority' } } )"
# sleep 2
mongo domifa_tests --eval "db.dropDatabase()"
# sleep 2
mongo domifa_tests --eval "db.createUser({user:'test', pwd:'test', roles:[{role:'readWrite', db:'domifa_tests'}] });"
# sleep 2
mongorestore --gzip --archive=dump_tests.mongo.gz
# sleep 2

echo ""
echo "#############################################################################"
echo "# RESET DB DONE √"
echo "#############################################################################"
echo ""