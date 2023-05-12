/* eslint-disable no-template-curly-in-string */
export const environment = {
  apiUrl: "${DOMIFA_BACKEND_URL}", // https://domifa-api.fabrique.social.gouv.fr/
  production: true,
  env: "${DOMIFA_ENV_ID}",
  sentryDsnPortailAdmin: "${DOMIFA_SENTRY_DSN_PORTAIL_ADMIN}",
  healthzCheck: {
    initialCheckDelay: 5,
    checkPeriodIfSuccess: 1800,
    checkPeriodIfError: 30,
  },
};
