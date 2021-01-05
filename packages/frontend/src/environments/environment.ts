export const environment = {
  apiUrl: "http://localhost:3000/",
  production: false,
  env: "dev", // DOMIFA_ENV_ID
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 18, // 17=prod, 18=dev,tests
  },
  healthzCheck: {
    initialCheckDelay: 60,
    checkPeriodIfSuccess: 600,
    checkPeriodIfError: 5,
  },
};
