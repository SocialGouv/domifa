# Contributing

## Local env

1. Create a `packages/backend/.env` file
    Ask yassine ;)

1. Start Mongo

    ```sh
    docker-compose up mongo
    docker-compose exec -T mongo mongorestore --gzip --archive < dump_test.gzip
    docker-compose exec -T mongo mongo domifa --eval "db.createUser({user:'travis', pwd:'test', roles:[{role:'readWrite', db:'domifa'}] });"  
    ```

1. Launch the docker compose env

    ```sh
    $ docker-compose up
    # or production like
    $ docker-compose -f ./docker-compose.prod.yml up
    ```

### Migrations

Les migrations sont définies dans le fichier `/packages/backend/src/_migrations`.

Les migrations sont exécutées automatiquement au démarrage de l'application:

```bash
# /packages/backend
yarn start
```

Pour exécuter manuellement les migrations:

```bash
# /packages/backend
yarn run db:migrate-up
```

Pour faire un `rollback` sur une migration:

```bash
# /packages/backend
yarn run db:migrate-down:last
```

## Test cases

- Code-postal de votre structure test : 92600
