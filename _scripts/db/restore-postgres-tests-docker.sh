#!/bin/bash
env=$1

echo ""
echo "#############################################################################"
echo "# START RESET TRAVIS DB..."
echo "#############################################################################"
echo ""

# terminate other connections
SQL="psql --username \"domifa_tests\" --dbname postgres -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE  pid <> pg_backend_pid() AND datname = 'domifa_tests'\""
(set -x && docker exec -it domifa-postgres-dev bash -c "$SQL")

# drop database (ignore error)
SQL="psql --username \"domifa_tests\" --dbname postgres -c \"DROP DATABASE domifa_tests\""
(set -x && docker exec -it domifa-postgres-dev bash -c "$SQL")

# create database
SQL="psql --username \"\$POSTGRES_USER\" --dbname postgres -c \"CREATE DATABASE domifa_tests WITH OWNER=domifa_tests\""
(set -x && docker exec -it domifa-postgres-dev bash -c "$SQL")

# restore dump
(set -x && docker exec domifa-postgres-dev bash -c "pg_restore --username=domifa_tests --role=domifa_tests --no-owner --exit-on-error --verbose --dbname=domifa_tests ${CONTAINER_DUMP_PATH}")

docker exec domifa-postgres-dev bash -c " \
export POSTGRES_PASSWORD=BfYK51e6RUmyZnSgsL9BAQgu6f6ciKgTFB68
pg_restore --username=domifa_tests --no-owner --role=domifa_tests --exit-on-error --verbose --dbname=domifa_tests /app/_scripts/db/dump_tests.postgres.dump \
"

echo ""
echo "#############################################################################"
echo "# RESET DB DONE √"
echo "#############################################################################"
echo ""
