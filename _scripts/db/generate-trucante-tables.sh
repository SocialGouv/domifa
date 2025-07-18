#!/bin/bash

# Valeurs par défaut
SOURCE_DB_ENV="test"

# Parse des arguments
for i in "$@"; do
  case $i in
  --db=*)
    SOURCE_DB_ENV="${i#*=}"
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

# Variables
POSTGRES_CONTAINER_NAME=domifa-postgres
SOURCE_DATABASE="domifa_${SOURCE_DB_ENV}"
OUTPUT_FILE="_scripts/db/dumps/domifa_test.postgres.truncate-data.sql"

echo ""
echo "##############################################################################################"
echo "[INFO] GENERATING TRUNCATE FILE FROM DATABASE '$SOURCE_DATABASE'..."
echo "##############################################################################################"
echo ""

# Créer le répertoire de destination si nécessaire
mkdir -p "_scripts/db/dumps"

# Générer le contenu du fichier truncate
echo "-- IMPORTANT: make psql fails in case of error (else error won't be reported by github action)
\\set ON_ERROR_STOP true

-- NOTE
-- Pour générer les truncates:
-- SELECT 'TRUNCATE TABLE public.' ||  tablename || ' RESTART IDENTITY CASCADE;' FROM pg_tables WHERE tableowner='domifa_user' and tablename not like 'pg_%' and tablename not like 'sql_%' and tablename <> 'migrations';
" >"${OUTPUT_FILE}"

# Générer les commandes TRUNCATE automatiquement
(set -x && docker exec ${POSTGRES_CONTAINER_NAME} psql -d "${SOURCE_DATABASE}" -U domifa_user -t -c \
  "SELECT 'TRUNCATE TABLE public.' || tablename || ' RESTART IDENTITY CASCADE;'
FROM pg_tables
WHERE tableowner='domifa_user'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
  AND tablename <> 'migrations'
  AND tablename <> 'spatial_ref_sys'
ORDER BY tablename;" >>"${OUTPUT_FILE}")

if [ $? -ne 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] UNEXPECTED ERROR RUNNING SCRIPT on container '${POSTGRES_CONTAINER_NAME}'!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

echo ""
echo "##############################################################################################"
echo "# [SUCCESS] TRUNCATE FILE GENERATED: ${OUTPUT_FILE} ✓"
echo "##############################################################################################"
echo ""
