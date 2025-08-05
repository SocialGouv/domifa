#!/bin/bash

# Variables
POSTGRES_CONTAINER_NAME=domifa-postgres
SOURCE_DATABASE="domifa_test"
OUTPUT_FILE="packages/backend/src/_migrations/_init-db/domifa_test_schema.sql"

echo ""
echo "##############################################################################################"
echo "[INFO] GENERATING DDL SCHEMA FROM DATABASE '$SOURCE_DATABASE'..."
echo "##############################################################################################"
echo ""

# Créer le répertoire de destination si nécessaire
mkdir -p "$(dirname "${OUTPUT_FILE}")"

# Supprimer le fichier existant s'il existe
if [ -f "${OUTPUT_FILE}" ]; then
    echo "🗑️  Suppression du fichier existant: ${OUTPUT_FILE}"
    rm "${OUTPUT_FILE}"
fi

# Tables à exclure (mêmes que dans votre script truncate)
EXCLUDE_TABLES="--exclude-table=migrations --exclude-table=spatial_ref_sys  --exclude-table=migrations_id_seq"

# Générer le DDL avec pg_dump
echo "🔄 Exécution de pg_dump..."

(set -x && docker exec ${POSTGRES_CONTAINER_NAME} pg_dump \
  -d "${SOURCE_DATABASE}" \
  -U domifa_user \
  --schema-only \
  --no-owner \
  --no-privileges \
  --no-comments \
  ${EXCLUDE_TABLES} \
  >"${OUTPUT_FILE}")

if [ $? -ne 0 ]; then
  echo ""
  echo "----------------------------------------------------------------------------------------------"
  echo "[ERROR] UNEXPECTED ERROR RUNNING pg_dump on container '${POSTGRES_CONTAINER_NAME}'!"
  echo "----------------------------------------------------------------------------------------------"
  exit 1
fi

# Nettoyer le fichier généré (enlever les SET et commentaires restants)
echo "🧹 Nettoyage du fichier DDL..."
sed -i \
  -E \
  -e '/^[[:space:]]*--/d' \
  -e '/^[[:space:]]*SET /d' \
  -e '/^[[:space:]]*SELECT pg_catalog.set_config/d' \
  -e '/^[[:space:]]*COMMENT ON /d' \
  -e '/^[[:space:]]*CREATE SCHEMA /d' \
  -e '/^[[:space:]]*ALTER SCHEMA /d' \
  -e '/^[[:space:]]*\\connect /d' \
  -e '/^[[:space:]]*$/d' \
  "${OUTPUT_FILE}"

echo ""
echo "##############################################################################################"
echo "[INFO] GENERATED DDL PREVIEW (first 50 lines):"
echo "##############################################################################################"
echo ""
head -50 "${OUTPUT_FILE}"
echo "..."

echo ""
echo "##############################################################################################"
echo "# [SUCCESS] DDL SCHEMA GENERATED: ${OUTPUT_FILE} ✓"
echo "##############################################################################################"
echo ""
