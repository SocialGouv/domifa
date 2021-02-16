#!/bin/bash
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"

source ${CURRENT_DIR}/.env

if [ -z "$DOMIFA_ENV_ID" ]; then
    echo "[ERROR] DOMIFA_ENV_ID is not defined in .env"
    exit 1
fi
if [ "$DOMIFA_ENV_ID" != "preprod" && "$DOMIFA_ENV_ID" != "formation" ]; then
    echo "[ERROR] script not allowed in this environment (only for 'preprod' & 'formation')"
    exit 1
else
    DOCKER_COMPOSE_PROJECT_NAME="$DOMIFA_ENV_ID"
fi

DUMP_DIR=/mnt/database/transfer
DUMP_FILE_MONGO=${DUMP_DIR}/domifa_PROD.mongo.gz
DUMP_FILE_POSTGRES=${DUMP_DIR}/domifa_PROD.postgres.custom.gz
if [ ! -f "$DUMP_FILE_MONGO" ]; then
    echo "[ERROR] MONGO dump file $DUMP_FILE_MONGO does not exists"
    exit 1
fi
if [ ! -f "$DUMP_FILE_POSTGRES" ]; then
    echo "[ERROR] POSTGRES dump file $DUMP_FILE_POSTGRES does not exists"
    exit 1
fi

echo ""
echo "#############################################################################"
echo "[INFO] THE FOLLOWING DUMPS WILL BE RESTORED TO:"
echo ""
echo "env: $DOMIFA_ENV_ID"
echo ""
echo ""
ls -lah $DUMP_FILE_MONGO
ls -lah $DUMP_FILE_POSTGRES
echo ""

echo ""
read -p "Are you sure? (y/N)?" choice
echo ""
case "$choice" in 
    y|Y ) echo "yes";;
    * ) echo "exit"; exit 0 ;;
esac

echo ""
echo "#############################################################################"
echo "[INFO] Stop backend & frontend"
echo ""
(set -x && sudo docker stop ${DOCKER_COMPOSE_PROJECT_NAME}_backend_1 ${DOCKER_COMPOSE_PROJECT_NAME}_frontend_1)

echo ""
echo "#############################################################################"
echo "[INFO] Restore MONGO dump from $DUMP_FILE_MONGO..."
echo ""

# copier le dump dans le container
(set -x && sudo docker cp $DUMP_FILE_MONGO ${DOCKER_COMPOSE_PROJECT_NAME}_mongo_1:/tmp)

if [ $? -eq 1 ]; then
    echo "[ERROR] exit"
    exit 3
fi

# restaurer le dump
sudo docker exec -t ${DOCKER_COMPOSE_PROJECT_NAME}_mongo_1 bash -c "set -x && mongorestore --nsInclude 'domifa.*' --nsFrom 'domifa.*' --nsTo 'domifa.*' -u \$MONGO_INITDB_ROOT_USERNAME -p \$MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase=admin --drop --gzip --archive=/tmp/domifa_PROD.mongo.gz"

if [ $? -eq 1 ]; then
    echo "[ERROR] exit"
    ex
    it 3
fi
echo ""
echo "#############################################################################"
echo "[INFO] Restore POSTGRES dump from $DUMP_FILE_POSTGRES..."
echo ""

# copier le dump dans le container
(set -x && sudo docker cp $DUMP_FILE_POSTGRES ${DOCKER_COMPOSE_PROJECT_NAME}_postgres_1:/tmp)
if [ $? -eq 1 ]; then
    echo "[ERROR] exit"
    exit 3
fi

# restaurer le dump
sudo docker exec -t ${DOCKER_COMPOSE_PROJECT_NAME}_postgres_1 bash -c "set -x && psql --username ${POSTGRES_USERNAME} --dbname postgres -c \"DROP DATABASE IF EXISTS \${POSTGRES_DB}\""
if [ $? -eq 1 ]; then
    echo "[ERROR] exit"
    exit 3
fi

sudo docker exec -t ${DOCKER_COMPOSE_PROJECT_NAME}_postgres_1 bash -c "set -x && psql --username ${POSTGRES_USERNAME} --dbname postgres -c \"CREATE DATABASE \${POSTGRES_DB}\""
if [ $? -eq 1 ]; then
    echo "[ERROR] exit"
    exit 3
fi

sudo docker exec -t ${DOCKER_COMPOSE_PROJECT_NAME}_postgres_1 bash -c "set -x && pg_restore --username=${POSTGRES_USERNAME} --no-owner --role=${POSTGRES_USERNAME} --exit-on-error --verbose --dbname=\${POSTGRES_DB} /tmp/domifa_PROD.postgres.custom.gz"
if [ $? -eq 1 ]; then
    echo "[ERROR] exit"
    exit 3
fi