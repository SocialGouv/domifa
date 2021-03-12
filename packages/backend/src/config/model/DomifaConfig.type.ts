import SMTPTransport = require("nodemailer/lib/smtp-transport");
import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { DomifaConfigDelay } from "./DomifaConfigDelay.type";
import { DomifaEnvId } from "./DomifaEnvId.type";

export type DomifaConfig = {
  envId: DomifaEnvId; // DOMIFA_ENV_ID
  version: string; // DOMIFA_DOCKER_IMAGE_VERSION (default to process.env.npm_package_version)
  apps: {
    frontendUrl: string; // DOMIFA_FRONTEND_URL
    backendUrl: string; // DOMIFA_BACKEND_URL
  };
  healthz: {
    frontendUrlFromBackend: string; // DOMIFA_HEALTHZ_FRONTEND_URL_FROM_BACKEND
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
    printEnv: boolean;
    printConfig: boolean;
    swaggerEnabled: boolean; // DOMIFA_SWAGGER_ENABLE
    sentry: {
      enabled: boolean; // enabled if SENTRY_DSN is defined
      sentryDns: string; // SENTRY_DSN
    };
    anonymizer: {
      password: string; // DOMIFA_ANONYMIZER_PASSWORD
    };
  };
  cron: {
    enable: boolean; // DOMIFA_CRON_ENABLED
    stats: {
      crontime: string; // DOMIFA_CRON_STATS_CRONTIME
      autoRunOnStartup: boolean; // DOMIFA_CRON_STATS_AUTO_RUN_STARTUP
    };
    emailUserGuide: {
      crontime: string; // DOMIFA_CRON_EMAIL_USER_GUIDE_CRONTIME
      delay: DomifaConfigDelay; // DOMIFA_CRON_EMAIL_USER_GUIDE_DELAY
      autoRunOnStartup: boolean; // DOMIFA_CRON_EMAIL_USER_GUIDE_AUTO_RUN_STARTUP
    };
    emailImportGuide: {
      crontime: string; // DOMIFA_CRON_EMAIL_IMPORT_GUIDE_CRONTIME
      delay: DomifaConfigDelay; // DOMIFA_CRON_EMAIL_IMPORT_GUIDE_DELAY
      autoRunOnStartup: boolean; // DOMIFA_CRON_EMAIL_IMPORT_GUIDE_AUTO_RUN_STARTUP
    };
    emailConsumer: {
      enableSendImmadiately: boolean; // DOMIFA_CRON_EMAIL_SEND_IMMEDIATELY
      crontime: string; // DOMIFA_CRON_EMAIL_CONSUMER_CRONTIME
      autoRunOnStartup: boolean; // DOMIFA_CRON_EMAIL_CONSUMER_AUTO_RUN_STARTUP
    };
    monitoringCleaner: {
      crontime: string; // DOMIFA_CRON_MONITORING_CLEANER_CRONTIME
      autoRunOnStartup: boolean; // DOMIFA_CRON_MONITORING_CLEANER_AUTO_RUN_STARTUP
      delay: DomifaConfigDelay; // DOMIFA_CRON_MONITORING_CLEANER_DELAY
    };
  };
  email: {
    emailsEnabled: boolean; // DOMIFA_EMAILS_ENABLE
    emailAddressRedirectAllTo: string; // DOMIFA_EMAIL_ADDRESS_REDIRECT_ALL_TO
    emailAddressErrorReport: string[]; // DOMIFA_ERROR_REPORT_EMAILS
    emailAddressAdmin: string; // DOMIFA_ADMIN_EMAIL
    emailAddressFrom: string; // DOMIFA_TIPIMAIL_FROM_EMAIL
    tipimailApi: {
      user: string; // DOMIFA_MAIL_SMTP_TIPIMAIL_USER
      pass: string; // DOMIFA_MAIL_SMTP_TIPIMAIL_PASS
    };
    smtp: SMTPTransport.Options;
  };
  sms: {
    smsIsEnabled: boolean;
    phoneNumberRedirectAllTo: string;
    apiKey: string;
  };
};
