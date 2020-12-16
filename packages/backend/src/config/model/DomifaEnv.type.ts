export type DomifaEnv = {
  DB_HOST: string;
  DB_PASS: string;
  DB_PORT: string;
  DB_USER: string;
  DB_NAME: string;
  DB_AUTH_SOURCE: string;
  FILES_IV: string;
  FILES_PRIVATE: string;
  DOMIFA_CORS_URL: string;
  DOMIFA_FRONTEND_URL: string;
  DOMIFA_BACKEND_URL: string;
  SECRET: string;
  UPLOADS_FOLDER: string;
  DOMIFA_ENV_ID: string;
  DOMIFA_VERSION: string;
  DOMIFA_MONGOOSE_DEBUG: string;
  DOMIFA_SWAGGER_ENABLE: string;
  DOMIFA_EMAILS_ENABLE: string;
  DOMIFA_ADMIN_EMAIL: string;
  DOMIFA_TIPIMAIL_FROM_EMAIL: string;
  DOMIFA_EMAIL_ADDRESS_REDIRECT_ALL_TO: string;
  DOMIFA_ERROR_REPORT_EMAILS: string;
  DOMIFA_CRON_ENABLED: string;
  DOMIFA_CRON_STATS_AUTO_RUN_STARTUP: string;
  DOMIFA_CRON_EMAIL_SEND_IMMEDIATELY: string;
  DOMIFA_CRON_EMAIL_USER_GUIDE_AUTO_RUN_STARTUP: string;
  DOMIFA_CRON_EMAIL_IMPORT_GUIDE_AUTO_RUN_STARTUP: string;
  DOMIFA_CRON_EMAIL_CONSUMER_AUTO_RUN_STARTUP: string;
  DOMIFA_CRON_STATS_CRONTIME: string;
  DOMIFA_CRON_EMAIL_USER_GUIDE_CRONTIME: string;
  DOMIFA_CRON_EMAIL_USER_GUIDE_DELAY: string;
  DOMIFA_CRON_EMAIL_IMPORT_GUIDE_CRONTIME: string;
  DOMIFA_CRON_EMAIL_IMPORT_GUIDE_DELAY: string;
  DOMIFA_CRON_EMAIL_CONSUMER_CRONTIME: string;
  DOMIFA_PRINT_ENV: string;
  DOMIFA_PRINT_CONFIG: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: string;
  POSTGRES_USERNAME: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DATABASE: string;
  POSTGRES_LOGGING: string;
  DOMIFA_MAIL_SMTP_ID: string;
  DOMIFA_MAIL_SMTP_MAILTRAP_HOST: string;
  DOMIFA_MAIL_SMTP_MAILTRAP_PORT: string;
  DOMIFA_MAIL_SMTP_MAILTRAP_USER: string;
  DOMIFA_MAIL_SMTP_MAILTRAP_PASSWORD: string;
  DOMIFA_MAIL_SMTP_TIPIMAIL_HOST: string;
  DOMIFA_MAIL_SMTP_TIPIMAIL_PORT: string;
  DOMIFA_MAIL_SMTP_TIPIMAIL_USER: string;
  DOMIFA_MAIL_SMTP_TIPIMAIL_PASSWORD: string;
  SENTRY_DSN: string;
  DOMIFA_CRON_MONITORING_CLEANER_DELAY: string;
  DOMIFA_CRON_MONITORING_CLEANER_CRONTIME: string;
  DOMIFA_CRON_MONITORING_CLEANER_AUTO_RUN_STARTUP: string;
};
