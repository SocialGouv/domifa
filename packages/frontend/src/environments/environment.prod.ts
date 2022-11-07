/* eslint-disable no-template-curly-in-string */
import { AppEnvironment } from "./AppEnvironment.type";

/*
Les variables bash ci-dessous sont substituées au moment du docker build (cf Dockerfile)
*/
export const environment: AppEnvironment = {
  // eslint-disable-next-line no-template-curly-in-string
  apiUrl: "${DOMIFA_BACKEND_URL}", // https://domifa-api.fabrique.social.gouv.fr/
  // eslint-disable-next-line no-template-curly-in-string
  portailAdminUrl: "${DOMIFA_PORTAIL_ADMINS_URL}",
  production: true,
  // eslint-disable-next-line no-template-curly-in-string
  env: "${DOMIFA_ENV_ID}",
  sentryDsnFrontend: "${DOMIFA_SENTRY_DSN_FRONTEND}",
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 17, // 17=prod, 18=dev,tests
  },
};
