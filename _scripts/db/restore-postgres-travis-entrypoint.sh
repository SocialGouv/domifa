#!/bin/bash

echo ""
echo "#############################################################################"
echo "# RESTORE POSTGRES TRAVIS DB..."
echo "#############################################################################"
echo ""

POSTGRES_DUMP_PATH=/app/_scripts/db/dumps/domifa_tests.postgres.dump
pg_restore --username=${POSTGRES_USERNAME} --role=${POSTGRES_USERNAME} --no-owner --exit-on-error --verbose --dbname=${POSTGRES_DATABASE} ${POSTGRES_DUMP_PATH}

echo ""
echo "#############################################################################"
echo "# RESET POSTGRES TRAVIS DB DONE √"
echo "#############################################################################"
echo ""