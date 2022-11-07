import { AppEnvironment } from "./AppEnvironment.type";

/* eslint-disable no-template-curly-in-string */
export const environment: AppEnvironment = {
  apiUrl: "${DOMIFA_BACKEND_URL}",
  production: true,
  env: "${DOMIFA_ENV_ID}",
  sentryDsnPortail: "${DOMIFA_SENTRY_DSN_PORTAIL}",
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 66,
  },
};
