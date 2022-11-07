export type AppEnvironment = {
  apiUrl: string;
  production: boolean;
  env: string;
  sentryDsnPortail: string;
  matomo: {
    url: string;
    siteId: number;
  };
};
