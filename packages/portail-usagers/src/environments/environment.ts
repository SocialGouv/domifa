import { AppEnvironment } from "./AppEnvironment.type";

export const environment: AppEnvironment = {
  apiUrl: "http://localhost:3000/",
  production: false,
  env: "dev", // DOMIFA_ENV_ID
  sentryDsnPortail: "",
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 18, // 17=prod, 18=dev,tests
  },
};
