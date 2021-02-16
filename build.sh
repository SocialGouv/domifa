#!/bin/bash
CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"

branch=$1

if [ -z "$branch" ]
then
  echo ""
  echo "#############################################################################"
  echo "# Build domifa app..."
  echo "#############################################################################"
  echo ""
  echo "Usage:"
  echo ""
  echo "$0 <branch>"
  echo "$0 <tag>"
  echo ""
  echo "Examples:"
  echo ""
  echo "$0 master"
  echo "$0 1.2.0"
  echo ""
  echo ""
  echo "#############################################################################"
  exit 1
fi

# from suglify: https://github.com/gitlabhq/gitlabhq/blob/master/app/assets/javascripts/lib/utils/text_utility.js
CI_COMMIT_REF_SLUG=$(echo "$branch" | tr '[:upper:]' '[:lower:]' | sed -e 's/[^a-zA-Z0-9_.-]/-/g' | sed -e 's/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛ]/-/g' | sed -e 's/\(\-\)\1\+/\1/g')
DOMIFA_DOCKER_IMAGE_VERSION=$CI_COMMIT_REF_SLUG

mkdir -p ${CURRENT_DIR}/node_modules


# install yarn dependencies
CMD="yarn install --frozen-lockfile --prefer-offline"
(set -x && sudo docker run --rm --volume=${CURRENT_DIR}:/app:delegated --volume=$HOME/.npm:/home/node/.npm:delegated --workdir=/app node:14.15.1-stretch ${CMD})

if [ $? -eq 1 ]; then
    echo "[ERROR] exit"
    exit 3
fi

# build app (frontend+backend)
CMD="yarn build"
(set -x && sudo docker run --rm --volume=${CURRENT_DIR}:/app:delegated --volume=$HOME/.npm:/home/node/.npm:delegated --workdir=/app node:14.15.1-stretch ${CMD})

if [ $? -eq 1 ]; then
    echo "[ERROR] exit"
    exit 3
fi

CI_REGISTRY_IMAGE="registry.gitlab.factory.social.gouv.fr/socialgouv/domifa"
TAG=${DOMIFA_DOCKER_IMAGE_VERSION}
CONTEXT="."

# build frontend image
IMAGE_NAME="$CI_REGISTRY_IMAGE/frontend"
DOCKER_BUILD_ARGS="--shm-size 768M -f packages/frontend/Dockerfile"
(set -x && sudo docker build \
      -t ${IMAGE_NAME}:${TAG} \
      $DOCKER_BUILD_ARGS \
      $CONTEXT)

if [ $? -eq 1 ]; then
    echo "[ERROR] exit"
    exit 3
fi

# build backend image
IMAGE_NAME="$CI_REGISTRY_IMAGE/backend"
DOCKER_BUILD_ARGS="--shm-size 768M -f packages/backend/Dockerfile"
(set -x && sudo docker build \
      -t ${IMAGE_NAME}:${TAG} \
      $DOCKER_BUILD_ARGS \
      $CONTEXT)

if [ $? -eq 1 ]; then
    echo "[ERROR] exit"
    exit 3
fi