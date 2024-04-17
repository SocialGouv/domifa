#!/usr/bin/env bash

set -e

directory=$(realpath $(dirname ${BASH_SOURCE[0]}))
echo $directory
pg_dump_directory=$directory/tmp/pg_dump
mkdir -p $pg_dump_directory

export PGHOST=localhost
export PGUSER=domifa_user
export PGPASSWORD=pizza
export PGDATABASE=domifa_dev

$directory/greenmask -v || (echo "You need to download greenmask from https://github.com/GreenmaskIO/greenmask/releases/tag/v0.1.9 in $directory" && exit)

sed "s%/tmp/pg_dump%$directory/tmp/pg_dump%" $directory/config.yaml > $directory/config.local.yaml
$directory/greenmask dump --config $directory/config.local.yaml

export PGHOST=localhost
export PGUSER=domifa_user
export PGPASSWORD=pizza
export PGDATABASE=domifa_dev_anonymized
pg_restore --clean --if-exists --no-owner --no-acl --verbose -d $PGDATABASE $pg_dump_directory/$(ls $pg_dump_directory | tail -n 1)


