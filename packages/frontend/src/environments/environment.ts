import { AppEnvironment } from "./AppEnvironment.type";

export const environment: AppEnvironment = {
  apiUrl: "http://localhost:3000/",
  portailAdminUrl: "http://localhost:4202/",
  production: false,
  env: "dev", // DOMIFA_ENV_ID
  sentryDsnFrontend: "",
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 18, // 17=prod, 18=dev,tests
  },
};
