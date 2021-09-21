
#!/bin/bash
branch=$1

if [ -z "$branch" ]
then
  echo ""
  echo "#############################################################################"
  echo "# Deploy domifa app..."
  echo "#############################################################################"
  echo ""
  echo "Usage:"
  echo ""
  echo "$0 version"
  echo ""
  echo "Examples:"
  echo ""
  echo "$0 master"
  echo "$0 1.2.0"
  echo ""
  echo ""
  echo "To list remote branchs & tags:"
  echo ""
  echo "git fetch --all --tags --prune"
  echo "git tag"
  echo "git branch -r"
  echo ""
  echo "#############################################################################"
  exit 1
else

  echo ""
  echo "----------------------------------------------------------------------------"
  echo "Checkout last master version..."
  (set -x && git checkout master && git pull)
  if [ $? -eq 1 ]; then
      echo "[ERROR] exit"
      exit 3
  fi

    # from suglify: https://github.com/gitlabhq/gitlabhq/blob/master/app/assets/javascripts/lib/utils/text_utility.js
  CI_COMMIT_REF_SLUG=$(echo "$branch" | tr '[:upper:]' '[:lower:]' | sed -e 's/[^a-zA-Z0-9_.-]/-/g' | sed -e 's/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛ]/-/g' | sed -e 's/\(\-\)\1\+/\1/g')
  DOMIFA_DOCKER_IMAGE_VERSION=$CI_COMMIT_REF_SLUG
  echo ""
  echo "----------------------------------------------------------------------------"
  echo "[WARN] PENSEZ A FAIRE UN BACKUP AVANT DE DEPLOYER: ./backup.sh"
  echo "----------------------------------------------------------------------------"
  echo "Docker tag TO DEPLOY: '$CI_COMMIT_REF_SLUG'"
  echo ""
  read -p "Are you sure? (y/N)?" choice
  echo ""
  case "$choice" in
    y|Y ) echo "yes";;
    * ) echo "exit"; exit 0 ;;
  esac

  echo ""
  echo "----------------------------------------------------------------------------"
  echo "Pull docker backend image '$DOMIFA_DOCKER_IMAGE_VERSION'"
  (set -x && sudo docker pull harbor.fabrique.social.gouv.fr/domifa/backend:${DOMIFA_DOCKER_IMAGE_VERSION})
  if [ $? -eq 1 ]; then
      echo "[ERROR] exit"
      exit 3
  fi
  echo ""
  echo "----------------------------------------------------------------------------"
  echo "Pull docker frontend image '$DOMIFA_DOCKER_IMAGE_VERSION'"
  (set -x && sudo docker pull harbor.fabrique.social.gouv.fr/domifa/frontend:${DOMIFA_DOCKER_IMAGE_VERSION})
  if [ $? -eq 1 ]; then
      echo "[ERROR] exit"
      exit 3
  fi

  echo ""
  echo "----------------------------------------------------------------------------"
  echo "Setting 'DOMIFA_DOCKER_IMAGE_VERSION=$DOMIFA_DOCKER_IMAGE_VERSION' in .env"
  (set -x && sed -i "/DOMIFA_DOCKER_IMAGE_VERSION=/c\DOMIFA_DOCKER_IMAGE_VERSION=$DOMIFA_DOCKER_IMAGE_VERSION" .env)
  if [ $? -eq 1 ]; then
      echo "[ERROR] exit"
      exit 3
  fi
  source .env
  if [ -z "$DOMIFA_ENV_ID" ]; then
      echo "[ERROR] DOMIFA_ENV_ID is not defined in .env"
      exit 3
  fi
  if [ "$DOMIFA_ENV_ID" == "prod" ]; then
      DOCKER_COMPOSE_PROJECT_NAME=master
  else
      DOCKER_COMPOSE_PROJECT_NAME="$DOMIFA_ENV_ID"
  fi
  echo ""
  echo "#############################################################################"
  echo "[INFO] DOCKER_COMPOSE_PROJECT_NAME: $DOCKER_COMPOSE_PROJECT_NAME"
  echo ""
  echo ""

  echo ""
  echo "----------------------------------------------------------------------------"
  echo "Deploy application"
  (set -x && sudo docker-compose --project-name $DOCKER_COMPOSE_PROJECT_NAME -f docker-compose.prod.yml up --build -d --remove-orphans --force-recreate)
  if [ $? -eq 1 ]; then
      echo "[ERROR] exit"
      exit 3
  fi
  echo ""
  echo "#############################################################################"
  echo ""
  echo "[INFO] COMMANDS:"
  echo ""
  echo "# Check backend logs, run"
  echo "sudo docker logs --tail 200 -f ${DOCKER_COMPOSE_PROJECT_NAME}_backend_1"
  echo ""
  echo "# clean obsolete images logs, run:"
  echo "sudo docker image prune --all"
  echo ""
  echo "# stop & remove application (datatabase & upload files won't be lost)"
  echo "sudo docker-compose --project-name master -f docker-compose.prod.yml up"
  echo ""
  echo "#############################################################################"
  echo ""
  echo "[INFO] DOMIFA_DOCKER_IMAGE_VERSION: $DOMIFA_DOCKER_IMAGE_VERSION"
  echo ""
  echo "[SUCCESS] Deployment successfull!"
  echo ""
  echo "#############################################################################"

fi