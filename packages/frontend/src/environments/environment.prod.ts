/* eslint-disable no-template-curly-in-string */
/*
Les variables bash ci-dessous sont substituées au moment du docker build (cf Dockerfile)
*/
export const environment = {
  // eslint-disable-next-line no-template-curly-in-string
  apiUrl: "${DOMIFA_BACKEND_URL}", // https://domifa-api.fabrique.social.gouv.fr/
  // eslint-disable-next-line no-template-curly-in-string
  portailAdminUrl: "${DOMIFA_PORTAIL_ADMINS_URL}",
  production: true,
  // eslint-disable-next-line no-template-curly-in-string
  env: "${DOMIFA_ENV_ID}",
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 17, // 17=prod, 18=dev,tests
  },
  healthzCheck: {
    initialCheckDelay: 5,
    checkPeriodIfSuccess: 3600,
    checkPeriodIfError: 100,
  },
};
