import { decodeMainSecret } from "@socialgouv/streaming-file-encryption";

import { appLogger } from "../util";
import { domifaConfigFileLoader } from "./domifaConfigFileLoader.service";
import {
  DomifaConfig,
  DomifaConfigSecurity,
  DomifaEnv,
  DOMIFA_ENV_IDS,
} from "./model";
import { configParser } from "./services/configParser.service";
import { join } from "node:path";

function getFallbackPackageVersion(): string {
  // `pnpm exec` doesn't always expose `npm_package_version`.
  // Use the backend package.json version as a stable fallback so
  // auth flows (JWT payload, etc.) don't crash in tests.
  try {
    // From both TS runtime (src/...) and JS runtime (dist/...), this resolves
    // to packages/backend/package.json.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("../../package.json").version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

let _domifaConfig: DomifaConfig;

export const domifaConfig = (env?: Partial<DomifaEnv>) => {
  if (!_domifaConfig) {
    _domifaConfig = loadConfig(env ?? loadEnvWithPreset());
  }
  return _domifaConfig;
};

export function loadEnvWithPreset({
  defaultEnv,
}: { defaultEnv?: Partial<DomifaEnv> } = {}): Partial<DomifaEnv> {
  const envFileName =
    process.env.ENV_FILE === "tests-local"
      ? ".env.backend.test.local.env"
      : ".env";

  const domifaEnv =
    defaultEnv ?? domifaConfigFileLoader.loadEnvFile(envFileName);

  const presetEnvFileName =
    domifaEnv.DOMIFA_ENV_PRESET ?? process.env.DOMIFA_ENV_PRESET;

  if (!presetEnvFileName) {
    console.warn(`[configService] DOMIFA_ENV_PRESET not found`);
    console.warn(`[configService] envFileName:`, envFileName);
    console.warn(`[configService] domifaEnv:`, domifaEnv);
  }

  let domifaPresetEnv = domifaConfigFileLoader.loadEnvFile(
    join(".env.preset", presetEnvFileName)
  );

  const presetParentEnvFileName = domifaPresetEnv.DOMIFA_ENV_PRESET_PARENT;

  if (presetParentEnvFileName) {
    const domifaPresetParentEnv = domifaConfigFileLoader.loadEnvFile(
      join(".env.preset", presetParentEnvFileName)
    );
    domifaPresetEnv = {
      ...domifaPresetParentEnv,
      ...domifaPresetEnv,
    };
  }
  const merged = {
    ...process.env, // specific config is here in dist environments
    ...domifaPresetEnv, // default values
    ...domifaEnv, // empty in dist env (but used in local environments)
  };
  if (merged.DOMIFA_ENV_PRIORITY === "process.env") {
    // DIST: global environment variables overrides files config
    appLogger.warn('[loadEnvWithPreset] "process.env" overrides files config');
    return {
      ...merged,
      ...process.env, // specific config is here in dist environments
    };
  } else {
    // LOCAL: files config overrides global environment (usefull for local tests env)
    return merged;
  }
}

/*
 * STRATEGIE:
 * - utilisation d'un fichier preset dédié via la variable "DOMIFA_ENV_PRESET" en fonction de l'environnement
 * - pour certaines variables non définies, calcul des valeurs par défaut en fonction des autres variables
 */
export function loadConfig(x: Partial<DomifaEnv>): DomifaConfig {
  // be sure that DOMIFA_ENV_PRESET is set
  configParser.parseString(x, "DOMIFA_ENV_PRESET");

  const envId = configParser.parseString(x, "DOMIFA_ENV_ID", {
    validValues: DOMIFA_ENV_IDS,
  });
  const frontendUrl = configParser.parseString(x, "DOMIFA_FRONTEND_URL");
  const portailUsagersUrl = configParser.parseString(
    x,
    "DOMIFA_PORTAIL_USAGERS_URL"
  );
  const portailAdminUrl = configParser.parseString(
    x,
    "DOMIFA_PORTAIL_ADMINS_URL"
  );

  const backendUrl = configParser.parseString(x, "DOMIFA_BACKEND_URL");

  const emailsEnabled = configParser.parseBoolean(x, "DOMIFA_EMAILS_ENABLE");

  const smsEnabled = configParser.parseBoolean(x, "DOMIFA_SMS_ENABLE");

  const sentryDsn = configParser.parseString(x, "DOMIFA_SENTRY_DSN_BACKEND", {
    required: false,
  });

  const config: DomifaConfig = {
    envId,
    version: configParser.parseString(x, "DOMIFA_VERSION", {
      defaultValue:
        process.env.npm_package_version ?? getFallbackPackageVersion(),
      required: false,
    }),
    apps: {
      portailUsagersUrl,
      portailAdminUrl,
      frontendUrl,
      backendUrl,
    },
    security: parseSecurityConfig(x),
    postgres: {
      host: configParser.parseString(x, "POSTGRES_HOST", {
        defaultValue: "postgres",
      }),
      port: configParser.parseInteger(x, "POSTGRES_PORT", {
        defaultValue: 5432,
      }),
      username: configParser.parseString(x, "POSTGRES_USERNAME"),
      password: configParser.parseString(x, "POSTGRES_PASSWORD"),
      database: configParser.parseString(x, "POSTGRES_DATABASE"),
      ssl: configParser.parseBoolean(x, "POSTGRES_SSL", {
        required: false,
        defaultValue: false,
      }),
    },
    upload: {
      bucketAccessKey: configParser.parseString(x, "S3_BUCKET_ACCESS_KEY"),
      bucketSecretKey: configParser.parseString(x, "S3_BUCKET_SECRET_KEY"),
      bucketEndpoint: configParser.parseString(x, "S3_BUCKET_ENDPOINT"),
      bucketRegion: configParser.parseString(x, "S3_BUCKET_REGION"),
      bucketName: configParser.parseString(x, "S3_BUCKET_NAME"),
      bucketRootDir: configParser.parseString(x, "S3_BUCKET_ROOT_DIR"),
    },
    dev: {
      swaggerEnabled: configParser.parseBoolean(x, "DOMIFA_SWAGGER_ENABLE"),
      sentry: {
        enabled:
          configParser.parseBoolean(x, "DOMIFA_SENTRY_ENABLED", {
            defaultValue: !!sentryDsn,
          }) && !!sentryDsn,
        debugModeEnabled: configParser.parseBoolean(
          x,
          "DOMIFA_SENTRY_DEBUG_MODE_ENABLED",
          {
            defaultValue: false,
          }
        ),
        sentryDsn,
      },
    },
    logger: {
      logHttpRequests: configParser.parseBoolean(
        x,
        "DOMIFA_LOG_HTTP_REQUESTS",
        {
          defaultValue: false,
        }
      ),
      logSqlRequests: configParser.parseBoolean(x, "DOMIFA_LOG_SQL_REQUESTS", {
        defaultValue: false,
      }),
    },
    cron: {
      enable: configParser.parseBoolean(x, "DOMIFA_CRON_ENABLED", {
        defaultValue: false,
      }),
    },
    brevo: {
      apiKey: configParser.parseString(x, "DOMIFA_MAIL_BREVO_API_KEY", {
        required: emailsEnabled,
      }),
      contactsUsersListId: configParser.parseString(
        x,
        "DOMIFA_MAIL_BREVO_CONTACTS_USERS_LIST_ID",
        {
          required: emailsEnabled,
        }
      ),
      contactsStructuresListId: configParser.parseString(
        x,
        "DOMIFA_MAIL_BREVO_CONTACTS_STRUCTURES_LIST_ID",
        {
          required: emailsEnabled,
        }
      ),
      newsletterListId: configParser.parseString(
        x,
        "DOMIFA_MAIL_BREVO_NEWSLETTER_LIST_ID",
        {
          required: false,
        }
      ),
      templates: {
        contactSupport: configParser.parseInteger(
          x,
          "DOMIFA_BREVO_TEMPLATES_CONTACT_FORM",
          {
            required: emailsEnabled,
          }
        ),

        userResetPassword: configParser.parseInteger(
          x,
          "DOMIFA_BREVO_TEMPLATES_USER_RESET_PASSWORD",
          {
            required: emailsEnabled,
          }
        ),
        userStructureAppointment: configParser.parseInteger(
          x,
          "DOMIFA_BREVO_TEMPLATES_USER_STRUCTURE_APPOINTMENT_CREATED",
          {
            required: emailsEnabled,
          }
        ),
        userAccountActivated: configParser.parseInteger(
          x,
          "DOMIFA_BREVO_TEMPLATES_USER_ACCOUNT_ACTIVATED",
          {
            required: emailsEnabled,
          }
        ),
        structureRefusal: configParser.parseInteger(
          x,
          "DOMIFA_BREVO_TEMPLATES_STRUCTURE_REFUSAL",
          {
            required: emailsEnabled,
          }
        ),
        structureDelete: configParser.parseInteger(
          x,
          "DOMIFA_BREVO_TEMPLATES_STRUCTURE_DELETE",
          {
            required: emailsEnabled,
          }
        ),
        userStructureCreatedByAdmin: configParser.parseInteger(
          x,
          "DOMIFA_BREVO_TEMPLATES_USER_ACCOUNT_CREATED_BY_ADMIN",
          {
            required: emailsEnabled,
          }
        ),
        structurePendingActivation: configParser.parseInteger(
          x,
          "DOMIFA_BREVO_TEMPLATES_STRUCTURE_PENDING_ACTIVATION",
          {
            required: emailsEnabled,
          }
        ),
        otpLogin: configParser.parseInteger(
          x,
          "DOMIFA_BREVO_TEMPLATES_OTP_LOGIN",
          {
            required: emailsEnabled,
          }
        ),
        otpAction: configParser.parseInteger(
          x,
          "DOMIFA_BREVO_TEMPLATES_OTP_ACTION",
          {
            required: emailsEnabled,
          }
        ),
      },
    },
    email: {
      emailsEnabled,
      emailAddressAdmin: configParser.parseString(x, "DOMIFA_ADMIN_EMAIL", {
        required: emailsEnabled,
      }),
      emailAddressErrorReport: configParser.parseStringArray(
        x,
        "DOMIFA_ERROR_REPORT_EMAILS",
        {
          required: false,
        }
      ),

      emailAddressRedirectAllTo: configParser.parseString(
        x,
        "DOMIFA_EMAIL_ADDRESS_REDIRECT_ALL_TO",
        {
          required: false,
        }
      ),
      otpProvider: configParser.parseString<"brevo" | "smtp">(
        x,
        "DOMIFA_OTP_EMAIL_PROVIDER",
        {
          required: false,
          defaultValue: "brevo",
          validValues: ["brevo", "smtp"],
        }
      ),
    },
    sms: {
      enabled: smsEnabled,
      phoneNumberRedirectAllTo: configParser.parseString(
        x,
        "DOMIFA_PHONE_NUMBER_REDIRECT_ALL_TO",
        {
          required: false,
        }
      ),
      apiKey: configParser.parseString(x, "DOMIFA_SMS_API_KEY", {
        required: smsEnabled,
      }),
    },
    openDataApps: {
      soliguideUrl: configParser.parseString(x, "SOLIGUIDE_URL", {
        required: false,
      }),
      soliguideToken: configParser.parseString(x, "SOLIGUIDE_TOKEN", {
        required: false,
      }),
      mssUrl: configParser.parseString(x, "MSS_URL", {
        required: false,
      }),
      mssToken: configParser.parseString(x, "MSS_TOKEN", {
        required: false,
      }),
      dataInclusionUrl: configParser.parseString(x, "DATA_INCLUSION_URL", {
        required: false,
      }),
      dataInclusionToken: configParser.parseString(x, "DATA_INCLUSION_TOKEN", {
        required: false,
      }),
    },
    smtp: parseSmtpConfig(x),
    metabase: {
      token: configParser.parseString(x, "METABASE_TOKEN", {
        required: true,
      }),
      url: configParser.parseString(x, "METABASE_URL", {
        required: true,
      }),
    },
    quotas: {
      usagersDocsDownloadPerDay: configParser.parseInteger(
        x,
        "DOMIFA_QUOTA_USAGERS_DOCS_DOWNLOAD_PER_DAY",
        { required: false, defaultValue: 100 }
      ),
      usagersDocsDownloadBlockPerDay: configParser.parseInteger(
        x,
        "DOMIFA_QUOTA_USAGERS_DOCS_DOWNLOAD_BLOCK_PER_DAY",
        { required: false, defaultValue: 200 }
      ),
      usagersDocsUploadPerDay: configParser.parseInteger(
        x,
        "DOMIFA_QUOTA_USAGERS_DOCS_UPLOAD_PER_DAY",
        { required: false, defaultValue: 100 }
      ),
      usagersDeletePerDay: configParser.parseInteger(
        x,
        "DOMIFA_QUOTA_USAGERS_DELETE_PER_DAY",
        { required: false, defaultValue: 100 }
      ),
      usagersDeleteBlockPerDay: configParser.parseInteger(
        x,
        "DOMIFA_QUOTA_USAGERS_DELETE_BLOCK_PER_DAY",
        { required: false, defaultValue: 200 }
      ),
    },
  };
  return config;
}

function parseSmtpConfig(x: Partial<DomifaEnv>): DomifaConfig["smtp"] {
  // SMTP host/user/pass must be present at boot — fail fast on misconfig.
  // Tests and local envs without emails should still set these to placeholders
  // (e.g. mailtrap). The live verify() ping is intentionally NOT run at boot:
  // a transient network blip would crash the whole API.
  return {
    host: configParser.parseString(x, "DOMIFA_SMTP_HOST"),
    user: configParser.parseString(x, "DOMIFA_SMTP_USER"),
    pass: configParser.parseString(x, "DOMIFA_SMTP_PASS"),
    port: configParser.parseInteger(x, "DOMIFA_SMTP_PORT", {
      required: false,
      defaultValue: 587,
    }),
    // Tipimail DKIM/SPF are configured on diffusion.fabrique.social.gouv.fr.
    // The FROM must stay on this domain otherwise deliverability tanks on
    // ISPs that enforce DMARC alignment (the whole reason we route around
    // Brevo for these recipients). The "DomiFa <…>" display name matches
    // what Brevo shows in the inbox preview so users see the same sender
    // identity regardless of which provider routed the email.
    from: configParser.parseString(x, "DOMIFA_SMTP_FROM", {
      required: false,
      defaultValue:
        "DomiFa <ne-pas-repondre@diffusion.fabrique.social.gouv.fr>",
    }),
    timeoutMs: configParser.parseInteger(x, "DOMIFA_SMTP_TIMEOUT_MS", {
      required: false,
      defaultValue: 10_000,
    }),
  };
}

function parseSecurityConfig(x: Partial<DomifaEnv>): DomifaConfigSecurity {
  return {
    mainSecret: decodeMainSecret(
      configParser.parseString(x, "DOMIFA_SECURITY_FILES_MAIN_SECRET")
    ),
    jwtSecret: configParser.parseString(x, "DOMIFA_SECURITY_JWT_SECRET"),
    internalUserAgent: configParser.parseString(
      x,
      "DOMIFA_INTERNAL_USER_AGENT",
      {
        required: false,
        defaultValue: "",
      }
    ),
    sessionDurationDays: configParser.parseInteger(x, "SESSION_DURATION_DAYS", {
      defaultValue: 7,
    }),
    sessionPurgeAfterDays: configParser.parseInteger(
      x,
      "SESSION_PURGE_AFTER_DAYS",
      {
        defaultValue: 365,
      }
    ),
    otpSecret: configParser.parseString(x, "DOMIFA_OTP_SECRET"),
    loginOtpBypassDomains: configParser
      .parseStringArray(x, "DOMIFA_LOGIN_OTP_BYPASS_DOMAINS", {
        required: false,
      })
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0),
  };
}
