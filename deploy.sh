#!/bin/bash
branch=$1

if [ -z "$branch" ]
then
  echo ""
  echo "###################################"
  echo "# Deploy domifa app..."
  echo "###################################"
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
  echo "$0 some-specific-branch"
  echo ""
  echo ""
  echo "To list remote branchs & tags:"
  echo ""
  echo "git fetch --all --tags"
  echo "git tag"
  echo "git branch -r"
  echo ""
  echo "###################################"
  exit 1
else
  echo ""
  echo "Fetching git branchs..."
  echo ""

  test_branch_exists=$(git ls-remote origin $branch)
  if [ -z "$test_branch_exists" ]
    then
    echo "###################################"
    echo ""
    echo "[ERROR] Branch '$branch' does not exists:"
    echo ""
    echo ""
    echo "Available tags:"
    (set -x && git tag)
    echo ""
    echo "To list remote branchs & tags:"
    echo "git branch -r"
    echo ""
    echo "###################################"
    exit 2
  else
     # from suglify: https://github.com/gitlabhq/gitlabhq/blob/master/app/assets/javascripts/lib/utils/text_utility.js
    CI_COMMIT_REF_SLUG=$(echo "$branch" | tr '[:upper:]' '[:lower:]' | sed -e 's/[^a-zA-Z0-9_.-]/-/g' | sed -e 's/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛ]/-/g' | sed -e 's/\(\-\)\1\+/\1/g')
    DOMIFA_DOCKER_IMAGE_VERSION=$CI_COMMIT_REF_SLUG
    echo ""
    echo "Git tag/branch TO DEPLOY: '$branch'"
    echo "Docker tag TO DEPLOY: '$CI_COMMIT_REF_SLUG'"
    echo ""
    read -p "Are you sure? (y/N)?" choice
    echo ""
    case "$choice" in 
      y|Y ) echo "yes";;
      * ) echo "exit"; exit 0 ;;
    esac
  
    echo ""
    echo "Switch to git branch '$branch'"
    (set -x && git checkout $branch)
    if [ $? -eq 1 ]; then
        echo "[ERROR] exit"
        exit 3
    fi
    echo ""
    echo "Merge branch '$branch'"
    (set -x && git merge origin/$branch)
    if [ $? -eq 1 ]; then
        echo "[ERROR] exit"
        exit 3
    fi
    echo ""
    echo "Pull docker backend image '$DOMIFA_DOCKER_IMAGE_VERSION'"
    (set -x && sudo docker pull registry.gitlab.factory.social.gouv.fr/socialgouv/domifa/backend:${DOMIFA_DOCKER_IMAGE_VERSION})
    if [ $? -eq 1 ]; then
        echo "[ERROR] exit"
        exit 3
    fi
    echo ""
    echo "Pull docker frontend image '$DOMIFA_DOCKER_IMAGE_VERSION'"
    (set -x && sudo docker pull registry.gitlab.factory.social.gouv.fr/socialgouv/domifa/frontend:${DOMIFA_DOCKER_IMAGE_VERSION})
    if [ $? -eq 1 ]; then
        echo "[ERROR] exit"
        exit 3
    fi
    echo ""
    echo "Setting 'DOMIFA_DOCKER_IMAGE_VERSION=$DOMIFA_DOCKER_IMAGE_VERSION' in .env"
    (set -x && sed -i "/DOMIFA_DOCKER_IMAGE_VERSION=/c\DOMIFA_DOCKER_IMAGE_VERSION=$DOMIFA_DOCKER_IMAGE_VERSION" .env)
    if [ $? -eq 1 ]; then
        echo "[ERROR] exit"
        exit 3
    fi
    echo ""
    echo "Deploy application"
    (set -x && sudo docker-compose -f docker-compose.prod.yml up --build -d --remove-orphans --force-recreate)
    if [ $? -eq 1 ]; then
        echo "[ERROR] exit"
        exit 3
    fi
    echo ""
    echo "Deployment successfull!"
    echo ""
    echo "To check backend logs, run"
    echo ""
    echo "sudo docker logs --tail 200 -f master_backend_1"
    echo ""
    echo ""
    echo "To clean obsolete images logs, run:"
    echo ""
    echo "sudo docker image prune --all"
    echo "Setting 'DOMIFA_DOCKER_IMAGE_VERSION=$DOMIFA_DOCKER_IMAGE_VERSION' in .env"
    echo ""
    echo "DOMIFA_DOCKER_IMAGE_VERSION: $DOMIFA_DOCKER_IMAGE_VERSION"
    echo ""
    echo "[SUCCESS]"
    echo ""

  fi

fi