export type AppEnvironment = {
  frontendUrl: string;
  apiUrl: string;
  portailAdminUrl: string;
  production: boolean;
  env: string;
  sentryDsnPortailStats: string;
  matomo: {
    url: string;
    siteId: number;
  };
};
