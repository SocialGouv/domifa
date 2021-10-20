# Docker build

## Backend

Pour tester le build de l'image, exécuter à la racine:

```bash
docker build . -f packages/backend/Dockerfile
# Successfully built 040c2ce6db6e
```

Pour tester manuellement, dans le container:

```bash
docker run --rm -it \
    -v $(pwd)/packages/backend/.env:/app/.env \
    --entrypoint=bash 040c2ce6db6e

# root@21de9a68fade:/app#
node dist/run-app.js
```

**NOTE**: le backend démarre, jusqu'à cette erreur car il n'y a pas de db (normal):

```bash
Error: getaddrinfo ENOTFOUND postgres
```

## Frontends

Pour tester le build des images, exécuter à la racine:

```bash
docker build . -f packages/frontend/Dockerfile

docker build . -f packages/portail-usagers/Dockerfile
```
