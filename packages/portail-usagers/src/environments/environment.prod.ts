/* eslint-disable no-template-curly-in-string */
export const environment = {
  apiUrl: "${DOMIFA_BACKEND_URL}", // https://domifa-api.fabrique.social.gouv.fr/
  production: true,
  env: "${DOMIFA_ENV_ID}",
  // TODO: update Matomo ID
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 66, // 17=prod, 18=dev,tests, 66=portail-usagers prod
  },
};
