#!/usr/bin/env bash

#

export BRANCH_NAME=${BRANCH_NAME:=$CI_COMMIT_REF_SLUG}
export COMMIT_TAG=${COMMIT_TAG:=$CI_COMMIT_TAG}
export COMMIT=${COMMIT:=$CI_COMMIT_SHA}
export ENVIRONMENT=${ENVIRONMENT:="fabrique-dev"};
export HASH_SIZE=${HASH_SIZE:=7}
export JOB_ID=${JOB_ID:=$CI_JOB_ID}
export NODE_ENV=${NODE_ENV:="development"}
export PROJECT_PATH=${PROJECT_PATH:=$CI_PROJECT_PATH}
export VERSION=${VERSION:=$CI_COMMIT_REF_NAME}

BRANCH_NAME_HASHED=$( printf "${BRANCH_NAME}" | sha1sum | cut -c1-${HASH_SIZE} )
export BRANCH_HASH=${BRANCH_HASH:="$BRANCH_NAME_HASHED"}

export DOMAIN="domifa.dev.fabrique.social.gouv.fr";

export K8S_PROJECT="domifa"
export K8S_NAMESPACE="${K8S_PROJECT}-feature-${BRANCH_HASH}"

#

if [[ "${BRANCH_NAME}" = "master" ]]; then
  export BRANCH_HASH=master;
  export K8S_NAMESPACE="${K8S_PROJECT}-${BRANCH_HASH}"
fi

if [[ -n "${COMMIT_TAG}" ]]; then
  export NODE_ENV="production"
  export IMAGE_TAG=$(printf "${COMMIT_TAG}" | sed "s/^v//")
  export BRANCH_HASH=$( printf "${COMMIT_TAG}" | sed "s/\./-/g" );
  export K8S_NAMESPACE="${K8S_PROJECT}-${BRANCH_HASH}"
fi

#

if [[ -n "${PRODUCTION+x}" ]]; then
  export BRANCH_HASH=prod;
  export K8S_NAMESPACE="${K8S_PROJECT}"
  #
  export DOMAIN="domifa.fabrique.social.gouv.fr";
else
  export DOMAIN="${BRANCH_HASH}.${DOMAIN}";
  #
fi

export API_HOST="api.${DOMAIN}";
export MONGODB_HOST="${K8S_PROJECT}-mongodb-${BRANCH_HASH}"

#

export API_URL="https://${API_HOST}"

#

printenv | grep \
  -e BRANCH_HASH \
  -e BRANCH_NAME \
  -e COMMIT \
  -e COMMIT_TAG \
  -e DOMAIN \
  -e ENVIRONMENT \
  -e HASH_SIZE \
  -e IMAGE_TAG \
  -e JOB_ID \
  -e K8S_NAMESPACE \
  -e K8S_PROJECT \
  -e NODE_ENV \
  -e PROJECT_PATH \
  -e REGISTRY \
  -e REGISTRY \
  \
  -e API_HOST \
  -e API_URL \
  -e MONGODB_HOST \
  \
  -e CONTEXT \
  -e PORT \
  -e IMAGE_NAME \
  | sort
