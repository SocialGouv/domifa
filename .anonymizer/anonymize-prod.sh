#!/usr/bin/env bash

set -e

exclude_tables="contact_support,expired_token,monitor_batch_process,spatial_ref_sys"

mkdir -p /tmp/pg_dump

cd /workspace/.anonymizer

cat config.yaml \
    | sed "s%{{tmp}}%/tmp/pg_dump%" \
    | sed "s%{{bucket_access_key}}%$bucket_access_key%" \
    | sed "s%{{bucket_secret_key}}%$bucket_secret_key%" \
    | sed "s%{{bucket_endpoint}}%$bucket_endpoint%" \
    | sed "s%{{bucket_name}}%$bucket_name%" \
    | sed "s%{{bucket_region}}%$bucket_region%" \
    | sed "s%{{type}}%directory%" \
    > config.local.yaml

yarn
yarn build

greenmask dump --config config.local.yaml -j 1 --exclude-table-data $exclude_tables
