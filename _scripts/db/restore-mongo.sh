#!/bin/sh
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"
# echo "##############################################################################################"
# echo "#"
# echo "# USAGE:"
# echo "#"
# echo "# $0 [--db=dev] [--dump=test] [--recreate-user]"
# echo "#"
# echo "##############################################################################################"

# DEFAULT VARIABLES
# on first container startup: this script is called without arguments: initialize dev database from test dump
TARGET_DB_ENV=dev
DUMP_ENV=test

for i in "$@"
do
case $i in
    --db=*)
      TARGET_DB_ENV="${i#*=}"
    ;;
    --dump=*)
      DUMP_ENV="${i#*=}"
    ;;
    --recreate-user)
      RECREATE_USER="true"
    ;;
    *)
    # unknown option
    echo ""
    echo "----------------------------------------------------------------------------------------------"
    echo "[WARN] INVALID OPTION '$i': ignore"
    echo "----------------------------------------------------------------------------------------------"
    echo ""
    ;;
esac
done


if [ -z "${MONGO_DUMP_PATH}" ]; then
  MONGO_DUMP_PATH="$CURRENT_DIR/dumps/domifa_$DUMP_ENV.mongo.gz"
fi

MONGO_DUMP_FROM_DATABASE="domifa_$DUMP_ENV"
MONGO_INITDB_DATABASE="domifa_$TARGET_DB_ENV"

if [ "$DUMP_ENV" = "test" ]; then
  MONGO_DUMP_FROM_DATABASE="domifa_test" # nom de la base d'origine
else
  MONGO_DUMP_FROM_DATABASE="domifa" # nom de la base d'origine: preprod
fi

if [ ! -f "$MONGO_DUMP_PATH" ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] '$MONGO_DUMP_PATH' does not exist"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

if [ -z "$MONGO_INITDB_ROOT_USERNAME" ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] env.MONGO_INITDB_ROOT_USERNAME not set"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi
if [ -z "$MONGO_INITDB_ROOT_PASSWORD" ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] env.MONGO_INITDB_ROOT_PASSWORD not set"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "----------------------------------------------------------------------------------------------"
echo "[INFO] INITIALIZE MONGO DB '$MONGO_INITDB_DATABASE' from '$MONGO_DUMP_PATH'..."
echo "----------------------------------------------------------------------------------------------"
echo ""

MONGO_AUTH="-u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase=admin"

if [ "$RECREATE_USER" = "true" ]; then

    echo "--> Clean users: db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority'   )"
    (set -x && mongo $MONGO_AUTH --eval "db.runCommand( { dropAllUsersFromDatabase: 1, writeConcern: { w: 'majority'   )")
    if [ $? -ne 0 ]; then
        echo ""
        echo "----------------------------------------------------------------------------------------------"
        echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT!"
        echo "----------------------------------------------------------------------------------------------"
        exit 1
    fi

    echo "--> Create user: db.createUser({user:'$MONGO_INITDB_ROOT_USERNAME', pwd:'$MONGO_INITDB_ROOT_PASSWORD', roles:[{role:'readWrite', db:'$MONGO_INITDB_DATABASE'] );"
    (set -x && mongo $MONGO_AUTH --eval "db.createUser({user:'$MONGO_INITDB_ROOT_USERNAME', pwd:'$MONGO_INITDB_ROOT_PASSWORD', roles:[{role:'readWrite', db:'$MONGO_INITDB_DATABASE'] );")
    if [ $? -ne 0 ]; then
        echo ""
        echo "----------------------------------------------------------------------------------------------"
        echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT!"
        echo "----------------------------------------------------------------------------------------------"
        exit 1
    fi

fi

echo "--> Restore mongo DB"
echo "mongorestore --nsInclude \"${MONGO_DUMP_FROM_DATABASE}.*\" --nsFrom \"${MONGO_DUMP_FROM_DATABASE}.*\" --nsTo \"${MONGO_INITDB_DATABASE}.*\" $MONGO_AUTH --drop --gzip --archive=$MONGO_DUMP_PATH"
(set -x && mongorestore --nsInclude "${MONGO_DUMP_FROM_DATABASE}.*" --nsFrom "${MONGO_DUMP_FROM_DATABASE}.*" --nsTo "${MONGO_INITDB_DATABASE}.*" $MONGO_AUTH --drop --gzip --archive=$MONGO_DUMP_PATH)

if [ $? -ne 0 ]; then
    echo ""
    echo "----------------------------------------------------------------------------------------------"
    echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT!"
    echo "----------------------------------------------------------------------------------------------"
    exit 1
fi

echo ""
echo "##############################################################################################"
echo "# [SUCCESS] INITIALIZE MONGO DB '$MONGO_INITDB_DATABASE': DONE √"
echo "##############################################################################################"
echo ""
