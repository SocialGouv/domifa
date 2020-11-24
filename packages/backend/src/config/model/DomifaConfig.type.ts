import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { DomifaEnvId } from "./DomifaEnvId.type";

export type DomifaConfig = {
  envId: DomifaEnvId; // DOMIFA_ENV_ID
  version: string; // DOMIFA_VERSION (default to process.env.npm_package_version)
  apps: {
    frontendUrl: string; // DOMIFA_FRONTEND_URL
    backendUrl: string; // DOMIFA_BACKEND_URL
  };
  security: {
    corsUrl: string; // DOMIFA_CORS_URL
    files: {
      iv: string; // FILES_IV
      private: string; // FILES_PRIVATE
    };
    jwtSecret: string; // SECRET
  };
  mongo: {
    host: string; // DB_HOST
    pass: string; // DB_PASS
    port: string; // DB_PORT
    user: string; // DB_USER
    name: string; // DB_NAME
    authSource: string; // DB_AUTH_SOURCE
    debug: boolean; // DOMIFA_MONGOOSE_DEBUG
  };
  postgres: {
    host: string; // POSTGRES_HOST
    port: number; // POSTGRES_PORT
    username: string; // POSTGRES_USERNAME
    password: string; // POSTGRES_PASSWORD
    database: string; // POSTGRES_DATABASE
    logging: LoggerOptions; // POSTGRES_LOGGING
  };
  upload: {
    basePath: string; // UPLOADS_FOLDER
  };
  dev: {
    swaggerEnabled: boolean; // DOMIFA_SWAGGER_ENABLE
    generateStatsOnStartup: boolean; // DOMIFA_GENERATE_STATS_ON_STARTUP
    sentry: {
      enabled: boolean; // enabled if SENTRY_DSN is defined
      sentryDns: string; // SENTRY_DSN
    };
  };
  email: {
    emailsCronEnabled: boolean; // DOMIFA_CRON_ENABLED
    emailsEnabled: boolean; // DOMIFA_EMAILS_ENABLE
    emailAddressAdmin: string; // DOMIFA_ADMIN_EMAIL
    emailAddressFrom: string; // DOMIFA_TIPIMAIL_FROM_EMAIL
    smtp: {
      user: string; // SMTP_USER
      pass: string; // SMTP_PASS
    };
  };
};
