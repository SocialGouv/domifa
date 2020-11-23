#!/bin/bash

for i in "$@"
do
case $i in
    --dump-path=*)
    MONGO_DUMP_PATH="$i#*="
    ;;
    --recreate-user)
    RECREATE_USER="true"
    ;;
    *)
    # unknown option
    echo ""
    echo "[WARN] INVALID OPTION '$i'"
    echo ""
    ;;
esac
done

env

if [ -z "$MONGO_DUMP_PATH" ]; then
MONGO_DUMP_PATH="/app/_scripts/db/dumps/domifa_tests.mongo.gz"
echo ""
echo "[WARN] MONGO_DUMP_PATH not set: use default: '$MONGO_DUMP_PATH'"
echo ""
fi

if [ ! -f "$MONGO_DUMP_PATH" ]; then
echo ""
echo "#############################################################################"
echo "# ERROR: '$MONGO_DUMP_PATH' does not exist"
echo "#"
echo "# USAGE:"
echo "#"
echo "# $0 --dump-path=/app/_scripts/db/dumps/domifa_tests.mongo.gz"
echo "#"
exit 1
fi

if [ -z "$MONGO_INITDB_ROOT_USERNAME" ]; then
echo ""
echo "#############################################################################"
echo "# ERROR: env.MONGO_INITDB_ROOT_USERNAME not set"
echo "#"
exit 1
fi
if [ -z "$MONGO_INITDB_ROOT_PASSWORD" ]; then
echo ""
echo "#############################################################################"
echo "# ERROR: env.MONGO_INITDB_ROOT_PASSWORD not set"
echo "#"
exit 1
fi
if [ -z "$MONGO_INITDB_DATABASE" ]; then
echo ""
echo "#############################################################################"
echo "# ERROR: env.MONGO_INITDB_ROOT_USERNAME not set"
echo "#"
exit 1
fi

echo ""
echo "#############################################################################"
echo "# INITIALIZE MONGO DB..."
echo "#############################################################################"
echo ""

MONGO_AUTH="-u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase=admin"

if [ "$RECREATE_USER" == "true" ]; then

    mongo $MONGO_AUTH --eval "db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority'   )"
    if [ $? -ne 0 ]; then
    echo ""
    echo "# UNEXPECTED ERROR RUNNING SCRIPT!"
    exit 1
    fi

    mongo $MONGO_AUTH --eval "db.createUser({user:'$MONGO_INITDB_ROOT_USERNAME', pwd:'$MONGO_INITDB_ROOT_PASSWORD', roles:[{role:'readWrite', db:'$MONGO_INITDB_DATABASE'] );"
    if [ $? -ne 0 ]; then
    echo ""
    echo "# UNEXPECTED ERROR RUNNING SCRIPT!"
    exit 1
    fi

fi

mongorestore $MONGO_AUTH --drop --gzip --archive=$MONGO_DUMP_PATH

if [ $? -ne 0 ]; then
echo ""
echo "# UNEXPECTED ERROR RUNNING SCRIPT!"
exit 1
fi

echo ""
echo "#############################################################################"
echo "# INITIALIZE MONGO DB: DONE √"
echo "#############################################################################"
echo ""