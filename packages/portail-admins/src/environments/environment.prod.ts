import { AppEnvironment } from "./AppEnvironment.type";

/* eslint-disable no-template-curly-in-string */
export const environment: AppEnvironment = {
  frontendUrl: "${DOMIFA_FRONTEND_URL}", // https://domifa-api.fabrique.social.gouv.fr/
  apiUrl: "${DOMIFA_BACKEND_URL}", // https://domifa-api.fabrique.social.gouv.fr/
  production: true,
  env: "${DOMIFA_ENV_ID}",
  sentryDsnPortailAdmin: "${DOMIFA_SENTRY_DSN_PORTAIL_ADMIN}",
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 118,
  },
};
