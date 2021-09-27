#!/bin/sh
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"

set -e

# restore last dump
${CURRENT_DIR}/restore-database-docker.sh --db=test
## apply migrations
docker exec -it domifa-backend bash -c "yarn db:test:migrate-up"
# convert to unlogged
set +e
# first run can fail due to unlogged table dependency
${CURRENT_DIR}/convert-postgres-tables-to-unlogged-docker.sh --db=test
set -e
${CURRENT_DIR}/convert-postgres-tables-to-unlogged-docker.sh --db=test
# export new dump
${CURRENT_DIR}/make-dump-database-docker.sh --db=test
# export new data dump
${CURRENT_DIR}/make-dump-data-only-docker.sh --db=test