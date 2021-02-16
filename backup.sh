#!/bin/bash
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"

source $CURRENT_DIR/.env # load env

if [ -z "$DOMIFA_ENV_ID" ]; then
    echo "[ERROR] DOMIFA_ENV_ID is not defined in .env"
    exit 3
fi

month_year=$(date "+%Y-%m")
today=$(date "+%Y-%m-%d-%H-%M")
base_dir=/mnt/database/backup-${DOMIFA_ENV_ID}-${month_year}/backup-${today}
mkdir -p $base_dir

MONGO_DUMP_PATH=${base_dir}/mongo_mongodump-${today}.gzip
POSTGRES_DUMP_NAME=postgres.pg_dump-${today}.postgres.custom.gz
POSTGRES_DUMP_PATH=${base_dir}/${POSTGRES_DUMP_NAME}

if [ "$DOMIFA_ENV_ID" == "prod" ]; then
    DOCKER_COMPOSE_PROJECT_NAME=master
    (set -x && sudo docker exec ${DOCKER_COMPOSE_PROJECT_NAME}_mongo_1 sh -c 'mongodump --archive --gzip' > ${MONGO_DUMP_PATH})
else
    DOCKER_COMPOSE_PROJECT_NAME="$DOMIFA_ENV_ID"
    (set -x && sudo docker exec ${DOCKER_COMPOSE_PROJECT_NAME}_mongo_1 sh -c "mongodump -u \$MONGO_INITDB_ROOT_USERNAME -p \$MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase=admin --archive --gzip" > ${MONGO_DUMP_PATH})
fi


(set -x && sudo docker exec ${DOCKER_COMPOSE_PROJECT_NAME}_postgres_1 bash -c "\
pg_dump --dbname=${POSTGRES_DATABASE} --username=\${POSTGRES_USER} --no-owner --format=custom  --compress=9 --file=/tmp/${POSTGRES_DUMP_NAME} \
")

(set -x && sudo docker cp ${DOCKER_COMPOSE_PROJECT_NAME}_postgres_1:/tmp/${POSTGRES_DUMP_NAME} ${POSTGRES_DUMP_PATH})
