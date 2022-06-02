export type DomifaEnv = {
  DOMIFA_ENV_PRESET: string;
  DOMIFA_ENV_PRIORITY: "files" | "process.env";
  /**
   * @deprecated use DOMIFA_SECURITY_FILES_IV instead
   */
  FILES_IV: string;
  /**
   * @deprecated use DOMIFA_SECURITY_FILES_PRIVATE instead
   */
  FILES_PRIVATE: string;
  DOMIFA_SECURITY_FILES_IV: string;
  DOMIFA_SECURITY_FILES_IV_SECOURS: string; // TEMP VALUE : supprimer une fois la réencryption réalisée
  DOMIFA_SECURITY_FILES_PRIVATE: string;
  DOMIFA_FRONTEND_URL: string;
  DOMIFA_PORTAIL_USAGERS_URL: string;
  DOMIFA_PORTAIL_ADMINS_URL: string;
  DOMIFA_BACKEND_URL: string;
  /**
   * @deprecated use DOMIFA_SECURITY_JWT_SECRET instead
   */
  SECRET: string;
  DOMIFA_SECURITY_JWT_SECRET: string;
  /**
   * @deprecated use DOMIFA_UPLOADS_FOLDER instead
   */
  UPLOADS_FOLDER: string;
  DOMIFA_UPLOADS_FOLDER: string;
  DOMIFA_ENV_ID: string;
  DOMIFA_VERSION: string;
  DOMIFA_SWAGGER_ENABLE: string;
  DOMIFA_EMAILS_ENABLE: string;
  DOMIFA_ADMIN_EMAIL: string;
  DOMIFA_TIPIMAIL_FROM_EMAIL: string;
  DOMIFA_EMAIL_ADDRESS_REDIRECT_ALL_TO: string;
  DOMIFA_ERROR_REPORT_EMAILS: string;
  DOMIFA_CRON_ENABLED: string;
  DOMIFA_CRON_EMAIL_SEND_IMMEDIATELY: string;
  DOMIFA_CRON_EMAIL_USER_GUIDE_AUTO_RUN_STARTUP: string;
  DOMIFA_CRON_EMAIL_IMPORT_GUIDE_AUTO_RUN_STARTUP: string;
  DOMIFA_CRON_EMAIL_CONSUMER_AUTO_RUN_STARTUP: string;
  DOMIFA_CRON_SMS_CONSUMER_AUTO_RUN_STARTUP: string;
  DOMIFA_CRON_STATS_CRONTIME: string;
  DOMIFA_CRON_EMAIL_USER_GUIDE_CRONTIME: string;
  DOMIFA_CRON_EMAIL_USER_GUIDE_DELAY: string;
  DOMIFA_CRON_EMAIL_IMPORT_GUIDE_CRONTIME: string;
  DOMIFA_CRON_EMAIL_IMPORT_GUIDE_DELAY: string;
  DOMIFA_CRON_EMAIL_CONSUMER_CRONTIME: string;
  DOMIFA_CRON_SMS_CONSUMER_CRONTIME: string;
  DOMIFA_CRON_SEND_END_DOM_CRONTIME: string;
  DOMIFA_CRON_FETCH_END_DOM_CRONTIME: string;
  DOMIFA_PRINT_ENV: string;
  DOMIFA_PRINT_CONFIG: string;
  DOMIFA_ANONYMIZER_PASSWORD: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: string;
  POSTGRES_USERNAME: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DATABASE: string;
  POSTGRES_LOGGING: string;
  POSTGRES_POOL_MAX_CONNEXIONS: string;
  DOMIFA_TYPEORM_RUN_ON_STARTUP: string;
  DOMIFA_TYPEORM_CREATE_DATABASE: string;
  DOMIFA_MAIL_SMTP_ID: string;
  DOMIFA_MAIL_SMTP_MAILTRAP_HOST: string;
  DOMIFA_MAIL_SMTP_MAILTRAP_PORT: string;
  DOMIFA_MAIL_SMTP_MAILTRAP_USER: string;
  DOMIFA_MAIL_SMTP_MAILTRAP_PASSWORD: string;
  DOMIFA_MAIL_SMTP_TIPIMAIL_HOST: string;
  DOMIFA_MAIL_SMTP_TIPIMAIL_PORT: string;
  DOMIFA_MAIL_SMTP_TIPIMAIL_USER: string;
  DOMIFA_MAIL_SMTP_TIPIMAIL_PASSWORD: string;
  DOMIFA_SENTRY_ENABLED: string;
  DOMIFA_SENTRY_DEBUG_MODE_ENABLED: string;
  SENTRY_DSN: string;
  DOMIFA_CRON_MONITORING_CLEANER_DELAY: string;
  DOMIFA_CRON_MONITORING_CLEANER_CRONTIME: string;
  DOMIFA_CRON_MONITORING_CLEANER_AUTO_RUN_STARTUP: string;
  DOMIFA_SMS_ENABLE: string;
  DOMIFA_SMS_API_KEY: string;
  DOMIFA_ENV_PRESET_PARENT: string;
  DOMIFA_PHONE_NUMBER_REDIRECT_ALL_TO: string;

  ELASTIC_APM_SERVICE_NAME: string;
  ELASTIC_APM_SECRET_TOKEN: string;
  ELASTIC_APM_SERVER_URL: string;
  ELASTIC_APM_ACTIVE: string;
};
