#!/bin/sh
# Replaces the ${DOMIFA_*} placeholders left in the Angular bundle with the
# pod environment, then hands over to the nginx4spa entrypoint.
set -eu

ROOT="${NGINX_HTML_ROOT:-/usr/share/nginx/html}"

for required in DOMIFA_BACKEND_URL DOMIFA_ENV_ID; do
  eval "value=\${$required:-}"
  if [ -z "$value" ]; then
    echo "[nginx-runtime-env] $required is required" >&2
    exit 1
  fi
done

export DOMIFA_FRONTEND_URL="${DOMIFA_FRONTEND_URL:-}"
export DOMIFA_PORTAIL_ADMINS_URL="${DOMIFA_PORTAIL_ADMINS_URL:-}"
export DOMIFA_PORTAIL_USAGERS_URL="${DOMIFA_PORTAIL_USAGERS_URL:-}"
export DOMIFA_PORTAIL_STATS_URL="${DOMIFA_PORTAIL_STATS_URL:-}"
export DOMIFA_FRONTEND_META_ROBOTS="${DOMIFA_FRONTEND_META_ROBOTS:-noindex,nofollow}"
export DOMIFA_SENTRY_DSN_FRONTEND="${DOMIFA_SENTRY_DSN_FRONTEND:-}"
export DOMIFA_SENTRY_DSN_PORTAIL_ADMIN="${DOMIFA_SENTRY_DSN_PORTAIL_ADMIN:-}"
export DOMIFA_SENTRY_DSN_PORTAIL="${DOMIFA_SENTRY_DSN_PORTAIL:-}"
export DOMIFA_SENTRY_DSN_PORTAIL_STATS="${DOMIFA_SENTRY_DSN_PORTAIL_STATS:-}"

# Explicit list: other ${...} sequences in third-party code stay untouched.
VARS='${DOMIFA_BACKEND_URL} ${DOMIFA_FRONTEND_URL} ${DOMIFA_PORTAIL_ADMINS_URL} ${DOMIFA_PORTAIL_USAGERS_URL} ${DOMIFA_PORTAIL_STATS_URL} ${DOMIFA_ENV_ID} ${DOMIFA_FRONTEND_META_ROBOTS} ${DOMIFA_SENTRY_DSN_FRONTEND} ${DOMIFA_SENTRY_DSN_PORTAIL_ADMIN} ${DOMIFA_SENTRY_DSN_PORTAIL} ${DOMIFA_SENTRY_DSN_PORTAIL_STATS}'

find "$ROOT" -type f \( -name '*.js' -o -name 'index.html' \) | while IFS= read -r f; do
  envsubst "$VARS" < "$f" > "$f.tmp"
  cat "$f.tmp" > "$f"
  rm -f "$f.tmp"
done

exec /entrypoint.sh "$@"
