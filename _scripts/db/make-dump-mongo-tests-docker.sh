#!/bin/bash
env=$1

echo ""
echo "#############################################################################"
echo "# DUMP MONGO DB..."
echo "#############################################################################"
echo ""

docker exec domifa-mongo-dev bash -c "\
MONGO_AUTH=\"-u \${MONGO_INITDB_ROOT_USERNAME} -p \${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase=admin\"; \
mongodump \${MONGO_AUTH} -d domifa_tests --gzip --archive=/app/_scripts/db/dump_tests.mongo.gz
"

echo ""
echo "#############################################################################"
echo "# DUMP DONE √"
echo "#############################################################################"
echo ""
