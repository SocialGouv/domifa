#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"
PARENT_1_DIR="$( cd "$( dirname "${CURRENT_DIR}" )" && pwd )"
PARENT_2_DIR="$( cd "$( dirname "${PARENT_1_DIR}" )" && pwd )"
PROJECT_DIR="$( cd "$( dirname "${PARENT_2_DIR}" )" && pwd )"

(cd ${PROJECT_DIR} && pwd && npx jest -- templates)