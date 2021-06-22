import { CronExpression } from "@nestjs/schedule";
import * as path from "path";
import { appLogger } from "../util";
import { domifaConfigFileLoader } from "./domifaConfigFileLoader.service";
import {
  DomifaConfig,
  DomifaConfigSecurity,
  DomifaEnv,
  DOMIFA_ENV_IDS,
} from "./model";
import { configParser } from "./services/configParser.service";
import { configTypeOrmLoggerParser } from "./services/configTypeOrmLoggerParser.service";
import SMTPTransport = require("nodemailer/lib/smtp-transport");

let _domifaConfig: DomifaConfig;

export const domifaConfig = (env?: Partial<DomifaEnv>) => {
  if (!_domifaConfig) {
    _domifaConfig = loadConfig(env ? env : loadEnvWithPreset());
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
    domifaEnv["DOMIFA_ENV_PRESET"] ?? process.env["DOMIFA_ENV_PRESET"];

  let domifaPresetEnv = domifaConfigFileLoader.loadEnvFile(
    path.join(".env.preset", presetEnvFileName)
  );

  const presetParentEnvFileName = domifaPresetEnv["DOMIFA_ENV_PRESET_PARENT"];

  if (presetParentEnvFileName) {
    const domifaPresetParentEnv = domifaConfigFileLoader.loadEnvFile(
      path.join(".env.preset", presetParentEnvFileName)
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
  if (merged["DOMIFA_ENV_PRIORITY"] === "process.env") {
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

  const frontendUrlFromBackend = configParser.parseString(
    x,
    "DOMIFA_HEALTHZ_FRONTEND_URL_FROM_BACKEND",
    {
      defaultValue: frontendUrl,
    }
  );

  const backendUrl = configParser.parseString(x, "DOMIFA_BACKEND_URL");

  const emailsEnabled = configParser.parseBoolean(x, "DOMIFA_EMAILS_ENABLE");

  const smsEnabled = configParser.parseBoolean(x, "DOMIFA_SMS_ENABLE");

  const sentryDns = configParser.parseString(x, "DOMIFA_SENTRY_DNS", {
    required: false,
  });

  const smtpOptions = buildSmtpOptions(x, { required: emailsEnabled });

  const config: DomifaConfig = {
    envId,
    version: configParser.parseString(x, "DOMIFA_DOCKER_IMAGE_VERSION", {
      defaultValue: process.env.npm_package_version,
      required: false,
    }),
    apps: {
      frontendUrl,
      backendUrl,
    },
    healthz: {
      frontendUrlFromBackend,
    },
    security: parseSecurityConfig(x, {
      frontendUrl,
    }),
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
      logging: configTypeOrmLoggerParser.getTypeormLoggerOptions(
        x,
        "POSTGRES_LOGGING"
      ),
      poolMaxConnections: configParser.parseInteger(
        x,
        "POSTGRES_POOL_MAX_CONNEXIONS",
        {
          defaultValue: 10, // 10 is also driver default: https://node-postgres.com/api/pool#constructor
        }
      ),
    },
    typeorm: {
      runOnStartup: configParser.parseBoolean(
        x,
        "DOMIFA_TYPEORM_RUN_ON_STARTUP",
        {
          defaultValue: true,
        }
      ),
      createDatabase: configParser.parseBoolean(
        x,
        "DOMIFA_TYPEORM_CREATE_DATABASE",
        {
          defaultValue: false,
        }
      ),
    },
    upload: {
      basePath: configParser.parseString(x, "DOMIFA_UPLOADS_FOLDER", {
        deprecatedKey: "UPLOADS_FOLDER",
      }),
    },
    dev: {
      printEnv: configParser.parseBoolean(x, "DOMIFA_PRINT_ENV"),
      printConfig: configParser.parseBoolean(x, "DOMIFA_PRINT_CONFIG"),
      swaggerEnabled: configParser.parseBoolean(x, "DOMIFA_SWAGGER_ENABLE"),
      sentry: {
        enabled:
          configParser.parseBoolean(x, "DOMIFA_SENTRY_ENABLED", {
            defaultValue: !!sentryDns,
          }) && !!sentryDns,
        debugModeEnabled: configParser.parseBoolean(
          x,
          "DOMIFA_SENTRY_DEBUG_MODE_ENABLED",
          {
            defaultValue: false,
          }
        ),
        sentryDns,
      },
      anonymizer: {
        password: configParser.parseString(x, "DOMIFA_ANONYMIZER_PASSWORD", {
          required: false,
        }),
      },
    },
    cron: {
      enable: configParser.parseBoolean(x, "DOMIFA_CRON_ENABLED", {
        defaultValue: false,
      }),
      emailUserGuide: {
        crontime: configParser.parseString(
          x,
          "DOMIFA_CRON_EMAIL_USER_GUIDE_CRONTIME",
          {
            defaultValue: "0 15 * * TUE",
          }
        ),
        delay: configParser.parseDelay(
          x,

          "DOMIFA_CRON_EMAIL_USER_GUIDE_DELAY",

          {
            defaultValue: "7 days",
          }
        ),
        autoRunOnStartup: configParser.parseBoolean(
          x,
          "DOMIFA_CRON_EMAIL_USER_GUIDE_AUTO_RUN_STARTUP",
          { defaultValue: false }
        ),
      },
      emailImportGuide: {
        crontime: configParser.parseString(
          x,
          "DOMIFA_CRON_EMAIL_IMPORT_GUIDE_CRONTIME",
          {
            defaultValue: "0 15 * * TUE",
          }
        ),
        delay: configParser.parseDelay(
          x,
          "DOMIFA_CRON_EMAIL_IMPORT_GUIDE_DELAY",
          {
            defaultValue: "7 days",
          }
        ),
        autoRunOnStartup: configParser.parseBoolean(
          x,
          "DOMIFA_CRON_EMAIL_IMPORT_GUIDE_AUTO_RUN_STARTUP",
          { defaultValue: false }
        ),
      },
      emailConsumer: {
        enableSendImmadiately: configParser.parseBoolean(
          x,
          "DOMIFA_CRON_EMAIL_SEND_IMMEDIATELY",
          { defaultValue: true }
        ),
        crontime: configParser.parseString(
          x,
          "DOMIFA_CRON_EMAIL_CONSUMER_CRONTIME",
          {
            defaultValue: CronExpression.EVERY_5_MINUTES, // most of the time, the CRON is not necessary, as the mail consummer is triggered immediately by messageEmailSender
          }
        ),
        autoRunOnStartup: configParser.parseBoolean(
          x,
          "DOMIFA_CRON_EMAIL_CONSUMER_AUTO_RUN_STARTUP",
          { defaultValue: false }
        ),
      },
      smsConsumer: {
        crontime: configParser.parseString(
          x,
          "DOMIFA_CRON_SMS_CONSUMER_CRONTIME",
          {
            defaultValue: CronExpression.EVERY_DAY_AT_7PM,
          }
        ),
        autoRunOnStartup: configParser.parseBoolean(
          x,
          "DOMIFA_CRON_SMS_CONSUMER_AUTO_RUN_STARTUP",
          { defaultValue: false }
        ),
      },
      monitoringCleaner: {
        crontime: configParser.parseString(
          x,
          "DOMIFA_CRON_MONITORING_CLEANER_CRONTIME",
          {
            defaultValue: CronExpression.EVERY_DAY_AT_11PM,
          }
        ),
        autoRunOnStartup: configParser.parseBoolean(
          x,
          "DOMIFA_CRON_MONITORING_CLEANER_AUTO_RUN_STARTUP",
          { defaultValue: false }
        ),
        delay: configParser.parseDelay(
          x,
          "DOMIFA_CRON_MONITORING_CLEANER_DELAY",
          {
            defaultValue: "7 days",
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
      emailAddressFrom: configParser.parseString(
        x,
        "DOMIFA_TIPIMAIL_FROM_EMAIL",
        {
          required: emailsEnabled,
        }
      ),
      emailAddressRedirectAllTo: configParser.parseString(
        x,
        "DOMIFA_EMAIL_ADDRESS_REDIRECT_ALL_TO",
        {
          required: false,
        }
      ),
      smtp: smtpOptions,
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
  };
  if (config.dev.printEnv) {
    printEnv(x, config);
  }
  if (config.dev.printConfig) {
    // tslint:disable-next-line: no-console
    console.log(
      "[domifaConfig] config loaded:",
      JSON.stringify(config, undefined, 2)
    );
  }
  return config;
}
function parseSecurityConfig(
  x: Partial<DomifaEnv>,
  {
    frontendUrl,
  }: {
    frontendUrl: string;
  }
): DomifaConfigSecurity {
  const securityCorsEnabled = configParser.parseBoolean(
    x,
    "DOMIFA_SECURITY_CORS_ENABLED"
  );
  return {
    corsEnabled: securityCorsEnabled,
    corsUrl: configParser.parseString(x, "DOMIFA_CORS_URL", {
      defaultValue: securityCorsEnabled ? frontendUrl : undefined,
      required: securityCorsEnabled,
    }),
    files: {
      iv: configParser.parseString(x, "DOMIFA_SECURITY_FILES_IV", {
        deprecatedKey: "FILES_IV",
      }),
      private: configParser.parseString(x, "DOMIFA_SECURITY_FILES_PRIVATE", {
        deprecatedKey: "FILES_PRIVATE",
      }),
    },
    jwtSecret: configParser.parseString(x, "DOMIFA_SECURITY_JWT_SECRET", {
      deprecatedKey: "SECRET",
    }),
  };
}

function buildSmtpOptions(
  x: Partial<DomifaEnv>,
  { required }: { required: boolean }
): SMTPTransport.Options {
  const smtpId = configParser.parseString(x, "DOMIFA_MAIL_SMTP_ID", {
    validValues: ["MAILTRAP", "TIPIMAIL"],
    required,
  });

  return smtpId === "TIPIMAIL"
    ? {
        host: configParser.parseString(x, "DOMIFA_MAIL_SMTP_TIPIMAIL_HOST", {
          required,
        }),
        port: configParser.parseInteger(x, "DOMIFA_MAIL_SMTP_TIPIMAIL_PORT", {
          required,
        }),
        secure: false,
        auth: {
          user: configParser.parseString(x, "DOMIFA_MAIL_SMTP_TIPIMAIL_USER", {
            required,
          }),
          pass: configParser.parseString(
            x,
            "DOMIFA_MAIL_SMTP_TIPIMAIL_PASSWORD",
            { required }
          ),
        },
      }
    : {
        host: configParser.parseString(x, "DOMIFA_MAIL_SMTP_MAILTRAP_HOST", {
          required,
        }),
        port: configParser.parseInteger(x, "DOMIFA_MAIL_SMTP_MAILTRAP_PORT", {
          required,
        }),
        auth: {
          user: configParser.parseString(x, "DOMIFA_MAIL_SMTP_MAILTRAP_USER", {
            required,
          }),
          pass: configParser.parseString(
            x,
            "DOMIFA_MAIL_SMTP_MAILTRAP_PASSWORD",
            { required }
          ),
        },
      };
}

function printEnv(x: Partial<DomifaEnv>, config: DomifaConfig) {
  const envKeysToLog = Object.keys(x).filter((x) => !x.startsWith("npm_"));
  envKeysToLog.sort();

  const envToLog = envKeysToLog.reduce((acc, key) => {
    acc[key] = x[key];
    return acc;
  }, {});

  // tslint:disable-next-line: no-console
  console.log("[domifaConfig] env:", JSON.stringify(envToLog, undefined, 2));
}
