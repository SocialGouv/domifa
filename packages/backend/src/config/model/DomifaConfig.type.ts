import { DomifaConfigDelay } from "./DomifaConfigDelay.type";
import { DomifaConfigPostgres } from "./DomifaConfigPostgres.type";
import { DomifaEnvId } from "./DomifaEnvId.type";

export type DomifaConfigSecurity = {
  mainSecret: Uint8Array; // DOMIFA_SECURITY_FILES_MAIN_SECRET
  jwtSecret: string; // DOMIFA_SECURITY_JWT_SECRET
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
  typeorm: {
    runOnStartup: boolean; // DOMIFA_TYPEORM_RUN_ON_STARTUP
  };
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

    smsConsumer: {
      crontime: string; // DOMIFA_CRON_SMS_CONSUMER_CRONTIME
      fetchEndDomCronTime: string; // DOMIFA_CRON_FETCH_END_DOM_CRONTIME
    };
    monitoringCleaner: {
      crontime: string; // DOMIFA_CRON_MONITORING_CLEANER_CRONTIME
      delay: DomifaConfigDelay; // DOMIFA_CRON_MONITORING_CLEANER_DELAY
    };
  };
  brevo: {
    apiKey: string; // DOMIFA_MAIL_BREVO_API_KEY
    contactsListId: string; // DOMIFA_MAIL_BREVO_CONTACTS_LIST_ID
    templates: {
      // Contact form template
      contactSupport: number; // DOMIFA_BREVO_TEMPLATES_CONTACT_FORM
      // User reset password template
      userResetPassword: number; // DOMIFA_BREVO_TEMPLATES_USER_RESET_PASSWORD
      // User structure appointment created template
      userStructureAppointment: number; // DOMIFA_BREVO_TEMPLATES_USER_STRUCTURE_APPOINTMENT_CREATED
      // Structure hard reset template
      structureHardReset: number; // DOMIFA_BREVO_TEMPLATES_HARD_RESET
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
      // Import fail template
      importFail: number; // DOMIFA_BREVO_TEMPLATES_IMPORT_FAIL
    };
  };
  email: {
    emailsEnabled: boolean; // DOMIFA_EMAILS_ENABLE
    emailAddressRedirectAllTo: string; // DOMIFA_EMAIL_ADDRESS_REDIRECT_ALL_TO
    emailAddressErrorReport: string[]; // DOMIFA_ERROR_REPORT_EMAILS
    emailAddressAdmin: string; // DOMIFA_ADMIN_EMAIL
  };
  sms: {
    enabled: boolean; // DOMIFA_SMS_ENABLE
    phoneNumberRedirectAllTo: string; // DOMIFA_PHONE_NUMBER_REDIRECT_ALL_TO
    apiKey: string; // DOMIFA_SMS_API_KEY
  };
  openDataApps: {
    soliguideUrl: string;
    soliguideToken: string;
    dataInclusionUrl: string;
    dataInclusionToken: string;
  };
  metabase: {
    url: string;
    token: string;
  };
};
