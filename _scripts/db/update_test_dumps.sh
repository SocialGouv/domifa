#!/bin/sh
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"
DUMPS_DIR="${CURRENT_DIR}/dumps"

set +e
while ! ${CURRENT_DIR}/convert-postgres-tables-to-unlogged-docker.sh --db=test
do # first run can fail due to unlogged table dependency
 echo "Try again"
done
# export new dump
${CURRENT_DIR}/make-dump-database-docker.sh --db=test
# export new data dump
${CURRENT_DIR}/make-dump-data-only-docker.sh --db=test --exclude-table=migrations

cat ${DUMPS_DIR}/domifa_test.postgres.truncate-data.sql ${DUMPS_DIR}/domifa_test.postgres.restore-data-only.sql  > ${DUMPS_DIR}/domifa_test.postgres.truncate-restore-data-only.sql
