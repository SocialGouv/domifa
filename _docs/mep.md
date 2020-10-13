# Procédure de mise en prod

## Préparation et tests en PRE-PROD

Mettre à jour la version de la release dans le fichier [backend/package.json](../packages/backend/package.json)

Créer une branche et un tag `release candidate` correspondant à la release à livrer:

```bash
git checkout -b 1.18.x
git push
git tag 1.18.0-rc1
git push --tags
```

Puis, une fois le build passé sur gitlab (et les images docker crées), déployer en `préprod`:

```bash
# pre-prod
cd /home/factory/domifa
./deploy.sh 1.18.x-rc1
```

Si besoin, fixer des bugs à partir de la branche 1.18.x, et créer d'autres tags `release candidate`:

```bash
git checkout 1.18.x
git pull
git tag 1.18.0-rc2
git tag 1.18.0-rc3
git push --tags
```

## Mise en PROD

Créer et merger la "Release notes" à partir de la branche de la release à livrer: <https://github.com/SocialGouv/domifa/blob/1.18.x/packages/frontend/src/assets/files/news.json>

Ensuite, vérifier et mettre à jour si besoin `/home/factory/domifa/.env`.

Puis créer le tag de la version à mettre en prod:

```bash
git checkout 1.18.x
git pull
git tag 1.18.0
git push --tags
```

Puis, une fois le build passé sur gitlab (et les images docker crées), déployer en `PROD`:

Enfin

```bash
cd /home/factory/domifa
# faire un backup
./backup.sh
# déployer la nouvelle version
./deploy.sh 1.18.0
```

Enfin, merger la branche sur master.
