import SMTPTransport = require("nodemailer/lib/smtp-transport");
import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { DomifaConfigDelay } from "./DomifaConfigDelay.type";
import { DomifaEnvId } from "./DomifaEnvId.type";

export type DomifaConfigSecurity = {
  corsEnabled: boolean; // DOMIFA_SECURITY_CORS_ENABLED
  corsUrl: string; // DOMIFA_CORS_URL
  files: {
    iv: string; // DOMIFA_SECURITY_FILES_IV
    ivSecours: string; // DOMIFA_SECURITY_FILES_IV_SECOURS
    private: string; // DOMIFA_SECURITY_FILES_PRIVATE
  };
  jwtSecret: string; // SECRET
};

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
  security: DomifaConfigSecurity;
  postgres: {
    host: string; // POSTGRES_HOST
    port: number; // POSTGRES_PORT
    username: string; // POSTGRES_USERNAME
    password: string; // POSTGRES_PASSWORD
    database: string; // POSTGRES_DATABASE
    logging: LoggerOptions; // POSTGRES_LOGGING
    poolMaxConnections: number; // POSTGRES_POOL_MAX_CONNEXIONS
  };
  typeorm: {
    runOnStartup: boolean; // DOMIFA_TYPEORM_RUN_ON_STARTUP
    createDatabase: boolean; // DOMIFA_TYPEORM_CREATE_DATABASE
  };
  upload: {
    basePath: string; // UPLOADS_FOLDER
  };
  dev: {
    printEnv: boolean;
    printConfig: boolean;
    swaggerEnabled: boolean; // DOMIFA_SWAGGER_ENABLE
    sentry: {
      enabled: boolean; // DOMIFA_SENTRY_ENABLED (default: enabled if DOMIFA_SENTRY_DSN is defined)
      sentryDsn: string; // DOMIFA_SENTRY_DSN
      debugModeEnabled: boolean; // DOMIFA_SENTRY_DEBUG_MODE_ENABLED
    };
    anonymizer: {
      password: string; // DOMIFA_ANONYMIZER_PASSWORD
    };
  };
  cron: {
    enable: boolean; // DOMIFA_CRON_ENABLED
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
    smsConsumer: {
      crontime: string; // DOMIFA_CRON_SMS_CONSUMER_CRONTIME
      autoRunOnStartup: boolean; // DOMIFA_CRON_SMS_CONSUMER_AUTO_RUN_STARTUP
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
    smtp: SMTPTransport.Options;
  };
  sms: {
    enabled: boolean; // DOMIFA_SMS_ENABLE
    phoneNumberRedirectAllTo: string; // DOMIFA_PHONE_NUMBER_REDIRECT_ALL_TO
    apiKey: string; // DOMIFA_SMS_API_KEY
  };
};
