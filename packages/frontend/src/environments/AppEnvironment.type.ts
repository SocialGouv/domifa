export type AppEnvironment = {
  apiUrl: string;
  portailAdminUrl: string;
  production: boolean;
  env: string;
  sentryDsnFrontend: string;
  matomo: {
    url: string;
    siteId: number;
  };
};
