#!/bin/bash
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"

source $CURRENT_DIR/.env # load env

month_year=$(date "+%Y-%m")
today=$(date "+%Y-%m-%d-%H-%M")
base_dir=/mnt/database/backup-${month_year}/backup-${today}
mkdir -p $base_dir

MONGO_DUMP_PATH=${base_dir}/mongo_mongodump-${today}.gzip
POSTGRES_DUMP_NAME=postgres.pg_dump-${today}.custom.gz
POSTGRES_DUMP_PATH=${base_dir}/${POSTGRES_DUMP_NAME}


(set -x && sudo docker exec master_mongo_1 sh -c 'mongodump --archive --gzip' > ${MONGO_DUMP_PATH})

(set -x && sudo docker exec master_postgres_1 bash -c "\
pg_dump --dbname=${POSTGRES_DATABASE} --username=\${POSTGRES_USER} --no-owner --format=custom --file=/tmp/${POSTGRES_DUMP_NAME} \
")

(set -x && sudo docker cp master_postgres_1:/tmp/${POSTGRES_DUMP_NAME} ${POSTGRES_DUMP_PATH})