import { AppEnvironment } from "./AppEnvironment.type";

export const environment: AppEnvironment = {
  frontendUrl: "http://localhost:4200/",
  apiUrl: "http://localhost:3000/",
  portailAdminUrl: "http://localhost:4202/",
  production: false,
  env: "dev", // DOMIFA_ENV_ID
  sentryDsnPortailStats: "",
  matomo: {
    url: "https://matomo.fabrique.social.gouv.fr/",
    siteId: 118, // TODO: site Matomo dédié au portail pilotage
  },
};
