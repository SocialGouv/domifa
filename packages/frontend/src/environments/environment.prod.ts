/*
Les variables bash ci-dessous sont substituées au moment du docker build (cf Dockerfile)
*/
export const environment = {
  apiUrl: "${DOMIFA_BACKEND_URL}", // https://domifa-api.fabrique.social.gouv.fr/
  portailAdminUrl: "${DOMIFA_PORTAIL_ADMINS_URL}",
  production: true,
  env: "${DOMIFA_ENV_ID}",
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 17, // 17=prod, 18=dev,tests
  },
  healthzCheck: {
    initialCheckDelay: 5,
    checkPeriodIfSuccess: 60,
    checkPeriodIfError: 30,
  },
};
