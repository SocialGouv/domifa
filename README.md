# DomiFa

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f15dba30a35f44c5a62cfdea9c1e3729)](https://app.codacy.com/app/pYassine/domifa?utm_source=github.com&utm_medium=referral&utm_content=SocialGouv/domifa&utm_campaign=Badge_Grade_Dashboard)
[![Build Status](https://travis-ci.com/SocialGouv/domifa.svg?branch=master)](https://travis-ci.com/SocialGouv/domifa)
[![codecov](https://codecov.io/gh/SocialGouv/domifa/branch/master/graph/badge.svg)](https://codecov.io/gh/SocialGouv/domifa)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FSocialGouv%2Fdomifa.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FSocialGouv%2Fdomifa?ref=badge_shield)

> Faciliter l'accès aux droits pour les personnes sans domicile stable, en simplifiant la gestion de la domiciliation

## Docker

```sh
$ yarn
$ yarn build
#
$ docker build --shm-size 512M -f packages/backend/Dockerfile -t socialgouv/domifa/backend .
$ docker build -f packages/frontend/Dockerfile -t socialgouv/domifa/frontend .
#
#
# Tested with
$ docker run --rm -p 3000:3000 socialgouv/domifa/backend
$ docker run --rm --env API_URL=https://domifa-api.fabrique.social.gouv.fr/ --env PORT=4200 -p 4200:4200 socialgouv/domifa/frontend
```

## Release policy

### Auto

Trigger a custom build on [Travis](https://travis-ci.com/SocialGouv/domifa) (in the "More options" right menu) on the `master` branch with a custom config:

```yml
env:
  global:
    - RELEASE=true
```

You can change the lerna arguments though the `LERNA_ARGS` variable.

```yml
env:
  global:
    - LERNA_ARGS="--force-publish --yes"
    - RELEASE=true
```

## Database

### Backup database

```bash
sudo docker-compose exec mongo mongodump --out --gzip > /mnt/database/dump_`date "+%Y-%m-%d-%H-%M"`
```

You need an [Github token](https://github.com/settings/tokens/new) to release.

### Manual

You need an [Github token](https://github.com/settings/tokens/new) to release.

```sh
#
# Bump, push to git and publish to npm
$ GH_TOKEN==************ yarn lerna version

#
# You might want to add a Gif to your release to make it groovy ;)
```


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FSocialGouv%2Fdomifa.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FSocialGouv%2Fdomifa?ref=badge_large)
