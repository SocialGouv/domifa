# Environnements K8S

## Configuration des environnements K8S

La configuration des environnements se fait via les fichiers situés sous `.k8s/environments`.

Pour chiffrer une variable, on peut utiliser l'outil suivant:

- <https://socialgouv.github.io/sre-tools/>

Choisir:
- "dev2" pour les environnements `dev` et `preprod`
- "prod2" pour l' environnement de `prod`

## Environnements automatique K8S sur les branches de PR

Sur chaque PR, un environnement `.k8s/environments/dev` est créé automatiquement lors de sa création.

L'URL de cet environnement est visible directement sur la PR github ou bien dans la pipeline gitlab.

La base de données est initialisée lors de la création de la PR, mais n'est pas écrasée en cas de mise à jour de la PR.

Elle est initialisée à partir de:

- les migrations typeorm du dossier `_migrations_init-pr-env-k8s` lors du démarrage de l'application
- les données du dump `domifa_test.postgres.data-only.sql` lors du stage "Seed" de gitlab-ci (après le démarrage de l'application)

En cas d'ajout d'une migration, il faut donc:

**mettre à jour les dump de test**

```bash
# restore last dump
_scripts/db/update_test_dumps.sh
```
