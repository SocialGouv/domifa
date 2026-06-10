export type DomifaEnv = {
  DOMIFA_ENV_PRESET: string;
  DOMIFA_ENV_PRIORITY: "files" | "process.env";
  DOMIFA_SECURITY_FILES_MAIN_SECRET: string;
  DOMIFA_FRONTEND_URL: string;
  DOMIFA_PORTAIL_USAGERS_URL: string;
  DOMIFA_PORTAIL_ADMINS_URL: string;
  DOMIFA_BACKEND_URL: string;
  DOMIFA_SECURITY_JWT_SECRET: string;
  DOMIFA_INTERNAL_USER_AGENT: string;
  SESSION_DURATION_DAYS: string;
  SESSION_PURGE_AFTER_DAYS: string;

  // S3
  S3_BUCKET_ACCESS_KEY: string;
  S3_BUCKET_SECRET_KEY: string;
  S3_BUCKET_ENDPOINT: string;
  S3_BUCKET_NAME: string;
  S3_BUCKET_REGION: string;
  S3_BUCKET_ROOT_DIR: string;

  DOMIFA_ENV_ID: string;
  DOMIFA_VERSION: string;
  DOMIFA_SWAGGER_ENABLE: string;
  DOMIFA_EMAILS_ENABLE: string;
  DOMIFA_ADMIN_EMAIL: string;
  DOMIFA_EMAIL_ADDRESS_REDIRECT_ALL_TO: string;
  DOMIFA_ERROR_REPORT_EMAILS: string;
  DOMIFA_CRON_ENABLED: string;
  DOMIFA_ANONYMIZER_PASSWORD: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: string;
  POSTGRES_USERNAME: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DATABASE: string;
  POSTGRES_SSL: boolean;

  DOMIFA_MAIL_BREVO_API_KEY: string;
  DOMIFA_MAIL_BREVO_CONTACTS_USERS_LIST_ID: string;
  DOMIFA_MAIL_BREVO_CONTACTS_STRUCTURES_LIST_ID: string;
  DOMIFA_MAIL_BREVO_NEWSLETTER_LIST_ID: string;
  // Brevo email templates
  DOMIFA_BREVO_TEMPLATES_CONTACT_FORM: string;
  DOMIFA_BREVO_TEMPLATES_USER_RESET_PASSWORD: string;
  DOMIFA_BREVO_TEMPLATES_USER_STRUCTURE_APPOINTMENT_CREATED: string;
  DOMIFA_BREVO_TEMPLATES_USER_ACCOUNT_ACTIVATED: string;
  DOMIFA_BREVO_TEMPLATES_STRUCTURE_REFUSAL: string;
  DOMIFA_BREVO_TEMPLATES_STRUCTURE_DELETE: string;
  DOMIFA_BREVO_TEMPLATES_USER_ACCOUNT_CREATED_BY_ADMIN: string;
  DOMIFA_BREVO_TEMPLATES_STRUCTURE_PENDING_ACTIVATION: string;
  DOMIFA_BREVO_TEMPLATES_OTP_LOGIN: string;
  DOMIFA_BREVO_TEMPLATES_OTP_ACTION: string;
  DOMIFA_SENTRY_ENABLED: string;
  DOMIFA_SENTRY_DEBUG_MODE_ENABLED: string;
  DOMIFA_SENTRY_DSN_BACKEND: string;
  DOMIFA_LOG_HTTP_REQUESTS: string;
  DOMIFA_LOG_SQL_REQUESTS: string;
  DOMIFA_SMS_ENABLE: string;
  DOMIFA_SMS_API_KEY: string;
  DOMIFA_ENV_PRESET_PARENT: string;
  DOMIFA_PHONE_NUMBER_REDIRECT_ALL_TO: string;
  SOLIGUIDE_URL: string;
  SOLIGUIDE_TOKEN: string;
  MSS_URL: string;
  MSS_TOKEN: string;
  DATA_INCLUSION_URL: string;
  DATA_INCLUSION_TOKEN: string;
  METABASE_TOKEN: string;
  METABASE_URL: string;
  // SMTP
  DOMIFA_SMTP_HOST: string;
  DOMIFA_SMTP_PORT: string;
  DOMIFA_SMTP_USER: string;
  DOMIFA_SMTP_PASS: string;
  DOMIFA_SMTP_FROM: string;
  DOMIFA_SMTP_TIMEOUT_MS: string;
  DOMIFA_OTP_SECRET: string;
  // OTP email delivery provider. "brevo" uses BrevoSenderService templates;
  // "smtp" uses the SMTP transport (tipimail). Default: "brevo".
  DOMIFA_OTP_EMAIL_PROVIDER: string;
  // Comma-separated email domains (e.g. "croix-rouge.fr,partner.org") whose
  // structure users skip the login OTP entirely. Empty by default. Used when
  // an org's mail filter quarantines OTP emails — those users still authenticate
  // by password but no second factor is enforced.
  DOMIFA_LOGIN_OTP_BYPASS_DOMAINS: string;
  // Behavioural daily quotas per structure. Phase 1: alert only (no blocking).
  // The cron flags any structure crossing the threshold over a Paris calendar
  // day for the matching action and surfaces a row in the security alert email.
  DOMIFA_QUOTA_USAGERS_DOCS_DOWNLOAD_PER_DAY: string;
  DOMIFA_QUOTA_USAGERS_DOCS_UPLOAD_PER_DAY: string;
  DOMIFA_QUOTA_USAGERS_DELETE_PER_DAY: string;
};
