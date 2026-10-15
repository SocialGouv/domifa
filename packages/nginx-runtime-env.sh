#!/bin/sh
# Build-once / deploy-many pour les SPA Angular.
#
# Les 3 fronts figeaient leurs URLs au BUILD (envsubst sur environment.prod.ts avant `ng build`),
# ce qui rendait chaque image liée à un environnement. Ici on laisse les placeholders ${DOMIFA_*}
# survivre dans le bundle compilé et on les substitue AU DÉMARRAGE du conteneur, à partir des
# variables d'environnement du pod (fournies par le ConfigMap du chart). Une seule image, N envs.
#
# Puis on chaîne l'entrypoint d'origine de l'image nginx4spa.
set -eu

ROOT="${NGINX_HTML_ROOT:-/usr/share/nginx/html}"

# Défauts vides : une variable non fournie -> chaîne vide (pas de placeholder résiduel dans le JS).
export DOMIFA_BACKEND_URL="${DOMIFA_BACKEND_URL:-}"
export DOMIFA_FRONTEND_URL="${DOMIFA_FRONTEND_URL:-}"
export DOMIFA_PORTAIL_ADMINS_URL="${DOMIFA_PORTAIL_ADMINS_URL:-}"
export DOMIFA_PORTAIL_USAGERS_URL="${DOMIFA_PORTAIL_USAGERS_URL:-}"
export DOMIFA_PORTAIL_STATS_URL="${DOMIFA_PORTAIL_STATS_URL:-}"
export DOMIFA_ENV_ID="${DOMIFA_ENV_ID:-}"
export DOMIFA_FRONTEND_META_ROBOTS="${DOMIFA_FRONTEND_META_ROBOTS:-}"
export DOMIFA_SENTRY_DSN_FRONTEND="${DOMIFA_SENTRY_DSN_FRONTEND:-}"
export DOMIFA_SENTRY_DSN_PORTAIL_ADMIN="${DOMIFA_SENTRY_DSN_PORTAIL_ADMIN:-}"
export DOMIFA_SENTRY_DSN_PORTAIL="${DOMIFA_SENTRY_DSN_PORTAIL:-}"

# Liste EXPLICITE des variables à substituer : envsubst ne touchera qu'à celles-ci, pas aux
# éventuels ${...} légitimes du JS minifié (template literals de librairies tierces).
VARS='${DOMIFA_BACKEND_URL} ${DOMIFA_FRONTEND_URL} ${DOMIFA_PORTAIL_ADMINS_URL} ${DOMIFA_PORTAIL_USAGERS_URL} ${DOMIFA_PORTAIL_STATS_URL} ${DOMIFA_ENV_ID} ${DOMIFA_FRONTEND_META_ROBOTS} ${DOMIFA_SENTRY_DSN_FRONTEND} ${DOMIFA_SENTRY_DSN_PORTAIL_ADMIN} ${DOMIFA_SENTRY_DSN_PORTAIL}'

if ! command -v envsubst >/dev/null 2>&1; then
  echo "[nginx-runtime-env] AVERTISSEMENT: envsubst introuvable, assets servis tels quels" >&2
else
  echo "[nginx-runtime-env] substitution runtime des placeholders DOMIFA_* dans $ROOT"
  find "$ROOT" -type f \( -name '*.js' -o -name 'index.html' \) | while IFS= read -r f; do
    envsubst "$VARS" < "$f" > "$f.tmp" && cat "$f.tmp" > "$f" && rm -f "$f.tmp"
  done
fi

exec /entrypoint.sh "$@"
