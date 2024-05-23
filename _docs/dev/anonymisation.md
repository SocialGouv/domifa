# Anonymisation / pseudonymisation

## Traitements effectués 

TODO

## Lancer en local

### Setup de Domifa

Avant de lancer la partie anonymisation, il faut effectuer la partie DB du setup de domifa (voir doc plus complète) :
- copier `.env` à partir du fichier `.env.dev.example.env` à la racine, et éditer pour ajouter un mot de passe postgres
- lancer postgres via `docker-compose.local.run.sh` à la racine
- insérer les données de test via `_scripts/db/restore-database-docker.sh --db=dev --dump=test` à la racine

### Setup de la partie anonymisation

- copier le fichier `.anonymizer/.env.example` dans `.anonymizer/.env` 
- éditer `.env` avec le mot de passe postgres utilisé dans le setup de domifa
- lancer `yarn` dans le dossier `.anonymizer` 
- lancer `./.anonymizer/anonymize.sh`  (à la première exécution le script le lien pour télécharger la bonne release de `greenmask`, à copier quelque part dans votre `PATH`. 

## Outils utilisés

Le script d'anonymisation utilise [Greenmask](https://greenmask.io/).

Toute la config est stockée dans le dossier `.anonymizer`.

Dans la config d'anonymisation de greenmask, on utilise : 
- les transformers de base pour les cas simples (notamment dans les colonnes qui ne contiennent pas de JSON, ou des colonnes JSON qui requièrent des opérations simples)
- des petits scripts en ts pour les opérations plus compliquées, stockées dans `.anonymizer/ts-transformers`.