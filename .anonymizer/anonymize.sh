#!/usr/bin/env bash

set -e

exclude_tables="contact_support,expired_token,monitor_batch_process"

cd "$(dirname "$0")"

source .env
pg_dump_directory=./tmp/pg_dump
mkdir -p $pg_dump_directory

greenmask -v || (echo "You need to download greenmask from https://github.com/GreenmaskIO/greenmask/releases/tag/v0.2.22 in $directory" && exit)

cat config.yaml \
    | sed "s%{{tmp}}%$(pwd)/tmp/pg_dump%" \
    | sed "s%{{bucket_access_key}}%$bucket_access_key%" \
    | sed "s%{{bucket_secret_key}}%$bucket_secret_key%" \
    | sed "s%{{bucket_endpoint}}%$bucket_endpoint%" \
    | sed "s%{{bucket_name}}%$bucket_name%" \
    | sed "s%{{bucket_region}}%$bucket_region%" \
    | sed "s%{{type}}%directory%" \
    > config.local.yaml

greenmask dump --config config.local.yaml --log-level debug --pgzip -j 10 --exclude-table-data $exclude_tables

export PGDATABASE=${PGDATABASE_RESTORE:-$PGDATABASE_anonymized}
pg_restore -j 4 --clean --if-exists --no-owner --no-acl --verbose -d $PGDATABASE $pg_dump_directory/$(ls $pg_dump_directory | tail -n 1)
