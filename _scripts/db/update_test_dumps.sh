#!/bin/sh
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"

set -e
# restore last dump
${CURRENT_DIR}/restore-database-docker.sh --db=test
while ! ${CURRENT_DIR}/convert-postgres-tables-to-logged-docker.sh --db=test
do # first run can fail due to unlogged table dependency
 echo "Try again"
done
## apply migrations
docker exec -it domifa-backend bash -c "yarn db:test:migrate-up"
# convert to unlogged
set +e
while ! ${CURRENT_DIR}/convert-postgres-tables-to-unlogged-docker.sh --db=test
do # first run can fail due to unlogged table dependency
 echo "Try again"
done
# export new dump
${CURRENT_DIR}/make-dump-database-docker.sh --db=test
# export new data dump
${CURRENT_DIR}/make-dump-data-only-docker.sh --db=test
