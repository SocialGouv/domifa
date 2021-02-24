#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"
PARENT_1_DIR="$( cd "$( dirname "${CURRENT_DIR}" )" && pwd )"
PARENT_2_DIR="$( cd "$( dirname "${PARENT_1_DIR}" )" && pwd )"
PROJECT_DIR="$( cd "$( dirname "${PARENT_2_DIR}" )" && pwd )"

# BROWSER=/usr/bin/firefox
BROWSER=/usr/bin/chromium

# open browser first
${BROWSER} &
sleep 1

find ${CURRENT_DIR} -type f -name "test.tmp.html" -exec ${BROWSER} {} \;