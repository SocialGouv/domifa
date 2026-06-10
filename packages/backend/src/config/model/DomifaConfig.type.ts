import { DomifaConfigPostgres } from "./DomifaConfigPostgres.type";
import { DomifaEnvId } from "./DomifaEnvId.type";

export type DomifaConfigSecurity = {
  mainSecret: Uint8Array; // DOMIFA_SECURITY_FILES_MAIN_SECRET
  jwtSecret: string; // DOMIFA_SECURITY_JWT_SECRET
  // Exact User-Agent string used by internal probes (e.g. blackbox monitoring)
  // that should bypass the throttler entirely. Empty disables the bypass.
  internalUserAgent: string; // DOMIFA_INTERNAL_USER_AGENT
  sessionDurationDays: number; // SESSION_DURATION_DAYS
  sessionPurgeAfterDays: number; // SESSION_PURGE_AFTER_DAYS
  // Server-side secret used as the HMAC-SHA256 key when storing OTP codes.
  // Never sent to clients. Without it the service refuses to issue OTPs —
  // we never want to fall back to storing plaintext or unkeyed hashes.
  otpSecret: string; // DOMIFA_OTP_SECRET
  // Lower-cased domains exempt from the structure login OTP. Set when the
  // org filters our OTP emails. Bypasses the second factor entirely for the
  // listed domains — manage carefully.
  loginOtpBypassDomains: string[]; // DOMIFA_LOGIN_OTP_BYPASS_DOMAINS
};

export type DomifaConfig = {
  envId: DomifaEnvId; // DOMIFA_ENV_ID
  version: string; // DOMIFA_VERSION (default to process.env.npm_package_version)
  apps: {
    frontendUrl: string; // DOMIFA_FRONTEND_URL
    portailUsagersUrl: string; // DOMIFA_PORTAIL_USAGERS_URL
    portailAdminUrl: string; // DOMIFA_PORTAIL_ADMINS_URL
    backendUrl: string; // DOMIFA_BACKEND_URL
  };
  security: DomifaConfigSecurity;
  postgres: DomifaConfigPostgres;
  upload: {
    bucketRootDir: string; // S3_BUCKET_ROOT_DIR
    bucketAccessKey: string; // S3_BUCKET_ACCESS_KEY
    bucketSecretKey: string; // S3_BUCKET_SECRET_KEY
    bucketEndpoint: string; // S3_BUCKET_ENDPOINT
    bucketName: string; // S3_BUCKET_NAME
    bucketRegion: string; //  S3_BUCKET_REGION
  };
  dev: {
    swaggerEnabled: boolean; // DOMIFA_SWAGGER_ENABLE
    sentry: {
      enabled: boolean; // DOMIFA_SENTRY_ENABLED (default: enabled if SENTRY_DSN is defined)
      sentryDsn: string; // DOMIFA_SENTRY_DSN_BACKEND
      debugModeEnabled: boolean; // DOMIFA_SENTRY_DEBUG_MODE_ENABLED
    };
  };
  logger: {
    logHttpRequests: boolean; // DOMIFA_LOG_HTTP_REQUESTS
    logSqlRequests: boolean; // DOMIFA_LOG_SQL_REQUESTS
  };
  cron: {
    enable: boolean; // DOMIFA_CRON_ENABLED
  };
  brevo: {
    apiKey: string; // DOMIFA_MAIL_BREVO_API_KEY
    contactsUsersListId: string; // DOMIFA_MAIL_BREVO_CONTACTS_USERS_LIST_ID
    contactsStructuresListId: string; // DOMIFA_MAIL_BREVO_CONTACTS_STRUCTURES_LIST_ID
    newsletterListId: string; // DOMIFA_MAIL_BREVO_NEWSLETTER_LIST_ID
    templates: {
      // Contact form template
      contactSupport: number; // DOMIFA_BREVO_TEMPLATES_CONTACT_FORM
      // User reset password template
      userResetPassword: number; // DOMIFA_BREVO_TEMPLATES_USER_RESET_PASSWORD
      // User structure appointment created template
      userStructureAppointment: number; // DOMIFA_BREVO_TEMPLATES_USER_STRUCTURE_APPOINTMENT_CREATED
      // User account activated template
      userAccountActivated: number; // DOMIFA_BREVO_TEMPLATES_USER_ACCOUNT_ACTIVATED
      // Structure refusal template
      structureRefusal: number; // DOMIFA_BREVO_TEMPLATES_STRUCTURE_REFUSAL
      // Structure delete template
      structureDelete: number; // DOMIFA_BREVO_TEMPLATES_STRUCTURE_DELETE
      // User account created by admin template
      userStructureCreatedByAdmin: number; // DOMIFA_BREVO_TEMPLATES_USER_ACCOUNT_CREATED_BY_ADMIN
      // Structure pending activation template
      structurePendingActivation: number; // DOMIFA_BREVO_TEMPLATES_STRUCTURE_PENDING_ACTIVATION
      // OTP login email template (used when otpProvider === "brevo")
      otpLogin: number; // DOMIFA_BREVO_TEMPLATES_OTP_LOGIN
      // OTP action confirmation email template (used when otpProvider === "brevo")
      otpAction: number; // DOMIFA_BREVO_TEMPLATES_OTP_ACTION
    };
  };
  email: {
    emailsEnabled: boolean; // DOMIFA_EMAILS_ENABLE
    emailAddressRedirectAllTo: string; // DOMIFA_EMAIL_ADDRESS_REDIRECT_ALL_TO
    emailAddressErrorReport: string[]; // DOMIFA_ERROR_REPORT_EMAILS
    emailAddressAdmin: string; // DOMIFA_ADMIN_EMAIL
    // Provider used for OTP emails. SMTP stays available for legacy/manual use.
    otpProvider: "brevo" | "smtp"; // DOMIFA_OTP_EMAIL_PROVIDER
  };
  sms: {
    enabled: boolean; // DOMIFA_SMS_ENABLE
    phoneNumberRedirectAllTo: string; // DOMIFA_PHONE_NUMBER_REDIRECT_ALL_TO
    apiKey: string; // DOMIFA_SMS_API_KEY
  };
  openDataApps: {
    soliguideUrl: string;
    soliguideToken: string;
    mssUrl: string;
    mssToken: string;
    dataInclusionUrl: string;
    dataInclusionToken: string;
  };
  smtp: {
    host: string; // DOMIFA_SMTP_HOST
    port: number; // DOMIFA_SMTP_PORT
    user: string; // DOMIFA_SMTP_USER
    pass: string; // DOMIFA_SMTP_PASS
    from: string; // DOMIFA_SMTP_FROM
    timeoutMs: number; // DOMIFA_SMTP_TIMEOUT_MS
  };
  metabase: {
    url: string;
    token: string;
  };
  // Per-structure behavioural quotas evaluated on a Paris calendar day. The
  // backend-cron pod alerts (no blocking, phase 1) when a structure crosses one
  // of these thresholds.
  quotas: {
    usagersDocsDownloadPerDay: number; // DOMIFA_QUOTA_USAGERS_DOCS_DOWNLOAD_PER_DAY
    usagersDocsUploadPerDay: number; // DOMIFA_QUOTA_USAGERS_DOCS_UPLOAD_PER_DAY
    usagersDeletePerDay: number; // DOMIFA_QUOTA_USAGERS_DELETE_PER_DAY
  };
};
