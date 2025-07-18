#!/bin/bash

echo ""
echo "🐘 =========================================="
echo "🚀 DOMIFA DATABASE DUMPS UPDATE"
echo "🐘 =========================================="
echo ""

CURRENT_DIR="$(cd "$(dirname "$0")" && pwd)"
DUMPS_DIR="${CURRENT_DIR}/dumps"

echo "📋 Étape 1/6: Export du schéma (DDL uniquement)"
${CURRENT_DIR}/make-dump-schema-docker.sh --db=test
echo "✅ Schéma exporté"
echo ""

echo "🗄️ Étape 2/6: Export complet de la base"
${CURRENT_DIR}/make-dump-database-docker.sh --db=test
echo "✅ Base exportée"
echo ""

echo "📊 Étape 3/6: Export des données uniquement"
${CURRENT_DIR}/make-dump-data-only-docker.sh --db=test --exclude-table=migrations
echo "✅ Données exportées"
echo ""

echo "🏗️ Étape 4/6: Génération du fichier de migration"
${CURRENT_DIR}/generate-ddl.sh --db=test
echo "✅ Migration générée"
echo ""

echo "🗑️ Étape 5/6: Génération du fichier truncate"
${CURRENT_DIR}/generate-trucante-tables.sh --db=test
echo "✅ Truncate généré"
echo ""

echo "🔗 Étape 6/6: Combinaison des fichiers truncate et restore"
cat ${DUMPS_DIR}/domifa_test.postgres.truncate-data.sql ${DUMPS_DIR}/domifa_test.postgres.restore-data-only.sql >${DUMPS_DIR}/domifa_test.postgres.truncate-restore-data-only.sql
echo "✅ Fichiers combinés"
echo ""

echo "🎉 =========================================="
echo "🎊 MISE À JOUR TERMINÉE AVEC SUCCÈS!"
echo "🎉 =========================================="
echo ""
