#!/bin/bash

CURRENT_DIR="$(cd "$(dirname "$0")" && pwd)"

find ${CURRENT_DIR} -type f -name "test.ref.html" -exec rm {} \;

find ${CURRENT_DIR} -type f -name "test.tmp.html" | while read file; do
  new_file="${file/tmp/ref}"
  cp "$file" "$new_file"
  echo "Fichier copié: $file -> $new_file"
done
