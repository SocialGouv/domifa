#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"
PARENT_1_DIR="$( cd "$( dirname "${CURRENT_DIR}" )" && pwd )"
PARENT_2_DIR="$( cd "$( dirname "${PARENT_1_DIR}" )" && pwd )"
PROJECT_DIR="$( cd "$( dirname "${PARENT_2_DIR}" )" && pwd )"

find ${CURRENT_DIR} -type f -name "test.ref.html" -exec rm {} \;
find ${CURRENT_DIR} -type f -name "test.tmp.html" -exec rename 's/tmp/ref/' {} \;