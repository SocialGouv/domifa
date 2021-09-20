// As default, in every files in the "/usr/share/nginx/html" directory, the envsub.sh script replaces %%KEY%% by VALUE where export KEY=VALUE in the global env var.
// https://github.com/SocialGouv/docker/tree/master/nginx4spa
export const environment = {
  apiUrl: "%%DOMIFA_BACKEND_URL%%", // https://domifa-api.fabrique.social.gouv.fr/
  production: true,
  env: "%%DOMIFA_ENV_ID%%",
  // TODO: update Matomo ID
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
