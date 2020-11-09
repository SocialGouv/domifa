#!/bin/bash

echo ""
echo "#############################################################################"
echo "# RESTORE POSTGRES TRAVIS DB..."
echo "#############################################################################"
echo ""

pg_restore --username=${POSTGRES_USERNAME} --role=${POSTGRES_USERNAME} --no-owner --exit-on-error --verbose --dbname=${POSTGRES_DATABASE} /app/_scripts/db/dump_tests.postgres.dump

echo ""
echo "#############################################################################"
echo "# RESET POSTGRES TRAVIS DB DONE √"
echo "#############################################################################"
echo ""