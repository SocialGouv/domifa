export type AppEnvironment = {
  frontendUrl: string;
  apiUrl: string;
  portailStatsUrl: string;
  production: boolean;
  env: string;
  sentryDsnPortailAdmin: string;
  matomo: {
    url: string;
    siteId: number;
  };
};
