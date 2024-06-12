export type AppEnvironment = {
  apiUrl: string;
  production: boolean;
  env: string;
  sentryDsnPortailAdmin: string;
  matomo: {
    url: string;
    siteId: number;
  };
};
