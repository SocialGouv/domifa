export const environment = {
  apiUrl: "http://localhost:3000/",
  portailAdminUrl: "http://localhost:4202/",
  production: true,
  env: "test",
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 18, // 17=prod, 18=dev,tests
  },
  healthzCheck: {
    initialCheckDelay: 3600,
    checkPeriodIfSuccess: 3600,
    checkPeriodIfError: 3600,
  },
};
