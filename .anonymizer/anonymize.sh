#!/usr/bin/env sh

set -e

./greenmask dump --config config.yaml

# export PGHOST=localhost
# export PGUSER=domifa_user
# export PGPASSWORD=pizza
# export PGDATABASE=domifa_dev_anonymized
# pg_restore --clean --if-exists --no-owner --no-acl --verbose -d domifa_dev_anonymized tmp/pg_dump/$(ls tmp/pg_dump/ | tail -n 1)
