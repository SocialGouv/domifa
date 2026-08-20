# Anonymisation / pseudonymisation 🎭

## Traitements effectués 🔄

Le processus d'anonymisation utilise Greenmask pour transformer les données sensibles tout en préservant la cohérence et l'utilisabilité des données. Les traitements incluent :

### 🔧 Transformations appliquées

- **Transformers de base** : Pour les colonnes simples (noms, emails, adresses, etc.)
- **Scripts TypeScript personnalisés** : Pour les opérations complexes sur les données JSON et les cas métier spécifiques (voir `.anonymizer/ts-transformers`)
- **Exclusion de tables sensibles** : Certaines tables contenant des données temporaires ou de logs sont complètement exclues

Le fichier `config.yaml` définit précisément quelles colonnes subissent quelles transformations.

## Lancer en local 🚀

### 🏗️ Setup de Domifa

Avant de lancer la partie anonymisation, il faut effectuer la partie DB du setup de domifa (voir doc plus complète) :

- copier `.env` à partir du fichier `.env.dev.example.env` à la racine, et éditer pour ajouter un mot de passe postgres
- lancer postgres via `docker-compose.local.run.sh` à la racine
- insérer les données de test via `_scripts/db/restore-database-docker.sh --db=dev --dump=test` à la racine

### ⚙️ Setup de la partie anonymisation

- copier le fichier `.anonymizer/.env.example` dans `.anonymizer/.env`
- éditer `.env` avec le mot de passe postgres utilisé dans le setup de domifa
- **Configurer la base de destination** : définir `PGDATABASE_anonymized` dans `.env` (ou utiliser `PGDATABASE_RESTORE`)
- installer les dépendances dans `.anonymizer` :
  ```bash
  cd .anonymizer
  pnpm install --frozen-lockfile
  ```
- lancer `pnpm build` ou `pnpm dev` dans `.anonymizer`
- **📥 Télécharger Greenmask** : récupérer la version v0.2.22 depuis [les releases GitHub](https://github.com/GreenmaskIO/greenmask/releases/tag/v0.2.22) et l'ajouter à votre `PATH`. Alternative sans installation : `docker run --rm greenmask/greenmask:v0.2.22`
- **✅ Vérifier la config** avant tout dump : `greenmask validate --config config.local.yaml`
- lancer `./.anonymizer/anonymize.sh`

### 🎯 Fonctionnement du script

Le script `anonymize.sh` :

1. **🔧 Génère** une configuration Greenmask dynamique à partir du template `config.yaml`
2. **📦 Effectue** un dump anonymisé de la base source (10 processus parallèles, compression parallèle `--pgzip`)
3. **🔄 Restaure** automatiquement le dump dans la base de destination (`pg_restore -j 4`)
4. **🧹 Nettoie** la base de destination avant restauration (`--clean --if-exists`)

### ⏳ Rétention des journaux

`app_log` et `app_log_security` sont limités aux **6 derniers mois** via `subset_conds` dans
`config.yaml`. Pour changer la fenêtre, éditer l'intervalle SQL dans les deux blocs.

## Outils utilisés 🛠️

Le script d'anonymisation utilise [Greenmask](https://greenmask.io/).

Toute la config est stockée dans le dossier `.anonymizer`.

Dans la config d'anonymisation de greenmask, on utilise :

- les **transformers de base** pour les cas simples (notamment dans les colonnes qui ne contiennent pas de JSON, ou des colonnes JSON qui requièrent des opérations simples)
- des **petits scripts en ts** pour les opérations plus compliquées, stockées dans `.anonymizer/ts-transformers`.

### 📁 Architecture des fichiers

- `config.yaml` : Configuration template avec placeholders
- `config.local.yaml` : Configuration générée dynamiquement (ne pas versionner)
- `anonymize.sh` : Script principal d'exécution
- `ts-transformers/` : Scripts TypeScript personnalisés pour les transformations complexes
- `tmp/pg_dump/` : Répertoire temporaire pour les dumps
