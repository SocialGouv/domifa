import { AppEnvironment } from "./AppEnvironment.type";

export const environment: AppEnvironment = {
  frontendUrl: "http://localhost:4200/",
  apiUrl: "http://localhost:3000/",
  production: false,
  env: "dev", // DOMIFA_ENV_ID
  sentryDsnPortailAdmin: "",
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 118, // 17=prod, 18=dev,tests
  },
};
