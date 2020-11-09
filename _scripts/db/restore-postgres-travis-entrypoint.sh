#!/bin/bash
env=$1

echo ""
echo "#############################################################################"
echo "# START RESET TRAVIS DB..."
echo "#############################################################################"
echo ""

pg_restore --username=domifa_tests --role=domifa_tests --no-owner --exit-on-error --verbose --dbname=domifa_tests /app/_scripts/db/dump_tests.postgres.dump

echo ""
echo "#############################################################################"
echo "# RESET DB DONE √"
echo "#############################################################################"
echo ""