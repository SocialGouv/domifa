#!/bin/sh
CURRENT_DIR="$(cd "$(dirname "$0")" && pwd)"
DUMPS_DIR="${CURRENT_DIR}/dumps"

# export new dump
${CURRENT_DIR}/make-dump-database-docker.sh --db=test
# export new data dump
${CURRENT_DIR}/make-dump-data-only-docker.sh --db=test --exclude-table=migrations

# generate truncate file automatically
${CURRENT_DIR}/generate-truncate.sh --db=test

cat ${DUMPS_DIR}/domifa_test.postgres.truncate-data.sql ${DUMPS_DIR}/domifa_test.postgres.restore-data-only.sql >${DUMPS_DIR}/domifa_test.postgres.truncate-restore-data-only.sql
