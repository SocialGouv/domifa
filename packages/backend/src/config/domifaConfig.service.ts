import { CronExpression } from "@nestjs/schedule";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { DomifaConfig, DomifaEnv, DOMIFA_ENV_IDS } from "./model";
import { configParser } from "./services/configParser.service";
import { configTypeOrmLoggerParser } from "./services/configTypeOrmLoggerParser.service";
import SMTPTransport = require("nodemailer/lib/smtp-transport");

let _domifaConfig: DomifaConfig;

export const domifaConfig = (env?: Partial<DomifaEnv>) => {
  if (!_domifaConfig) {
    _domifaConfig = loadConfig(env ? env : loadEnv());
  }
  return _domifaConfig;
};

function loadEnv(): Partial<DomifaEnv> {
  const envFile =
    process.env.NODE_ENV === "tests-local"
      ? ".env.backend.test.local.env"
      : ".env";
  const envFilePath = path.join(__dirname, "../../", envFile);

  if (!fs.existsSync(envFilePath)) {
    if (process.env.NODE_ENV) {
      // tslint:disable-next-line: no-console
      console.warn(
        `[configService] Env file ${envFilePath} not found: ignoring`
      );
    }
    return ({
      ...process.env,
    } as unknown) as Partial<DomifaEnv>;
  } else {
    // tslint:disable-next-line: no-console
    console.debug(`[configService] Loading config file "${envFilePath}"`);
    const { error, parsed } = dotenv.config({ path: envFile });
    if (error) {
      // tslint:disable-next-line: no-console
      console.error(`[configService] Error loading env file ${envFilePath}`, {
        error,
        sentry: true,
      });
    }
    return ({
      ...process.env,
      ...parsed, // override process.env from ${envFile}
    } as unknown) as Partial<DomifaEnv>;
  }
}

/*
 * STRATEGIE:
 * - définir les bonnes options par défaut en fonction de l'environnement
 */
export function loadConfig(x: Partial<DomifaEnv>): DomifaConfig {
  const envId = configParser.parseString(x, "DOMIFA_ENV_ID", {
    validValues: DOMIFA_ENV_IDS,
  });

  const frontendUrl = configParser.parseString(x, "DOMIFA_FRONTEND_URL", {
    defaultValue:
      envId === "dev" || envId === "test"
        ? "http://localhost:4200/" // default on LOCAL
        : undefined,
  });

  const frontendUrlFromBackend = configParser.parseString(
    x,
    "DOMIFA_HEALTHZ_FRONTEND_URL_FROM_BACKEND",
    {
      defaultValue: frontendUrl,
    }
  );

  const backendUrl = configParser.parseString(x, "DOMIFA_BACKEND_URL", {
    defaultValue:
      envId === "dev" || envId === "test"
        ? "http://localhost:3000/" // default on LOCAL
        : undefined,
  });

  const emailsEnabled = configParser.parseBoolean(x, "DOMIFA_EMAILS_ENABLE", {
    defaultValue:
      envId === "prod" || envId === "preprod" || envId === "formation"
        ? true
        : false,
  });

  const smsEnabled = configParser.parseBoolean(x, "DOMIFA_SMS_ENABLE", {
    defaultValue:
      envId === "prod" || envId === "preprod" || envId === "formation"
        ? true
        : false,
  });

  const sentryDns = configParser.parseString(x, "SENTRY_DSN", {
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
    security: {
      corsUrl: configParser.parseString(x, "DOMIFA_CORS_URL", {
        defaultValue:
          envId === "dev" || envId === "test"
            ? undefined // disabled by default in DEV
            : frontendUrl, // required in DIST
        required: false,
      }),
      files: {
        iv: configParser.parseString(x, "FILES_IV", {
          defaultValue:
            envId === "dev" || envId === "test"
              ? "gHSEyi222Nx5iwk7gF3vYxHX7aHki2XmuHqZq4pYF29xfBBuUE1rc2gv3wdU3DVW" // not critical locally
              : undefined,
        }),
        private: configParser.parseString(x, "FILES_PRIVATE", {
          defaultValue:
            envId === "dev" || envId === "test"
              ? "sXsQ4eT75rt4QcgJpMDvlTUzgxqlJIPX7psHCKDSUbNvIE1K4ykqrUssJW5v2jwr" // not critical locally
              : undefined,
        }),
      },
      jwtSecret: configParser.parseString(x, "SECRET"), // critical: no default value
    },
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
    },
    upload: {
      basePath: configParser.parseString(x, "UPLOADS_FOLDER", {
        defaultValue: "/files/",
      }),
    },
    dev: {
      printEnv: configParser.parseBoolean(x, "DOMIFA_PRINT_ENV", {
        defaultValue: false,
      }),
      printConfig: configParser.parseBoolean(x, "DOMIFA_PRINT_CONFIG", {
        defaultValue: false,
      }),
      swaggerEnabled: configParser.parseBoolean(x, "DOMIFA_SWAGGER_ENABLE", {
        defaultValue: envId === "dev" ? true : false,
      }),
      sentry: {
        enabled: !!sentryDns,
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
        defaultValue: envId === "test" ? false : true,
      }),
      stats: {
        crontime: configParser.parseString(x, "DOMIFA_CRON_STATS_CRONTIME", {
          defaultValue: CronExpression.EVERY_HOUR,
        }),
        autoRunOnStartup: configParser.parseBoolean(
          x,
          "DOMIFA_CRON_STATS_AUTO_RUN_STARTUP",
          { defaultValue: false }
        ),
      },
      emailUserGuide: {
        crontime: configParser.parseString(
          x,
          "DOMIFA_CRON_EMAIL_USER_GUIDE_CRONTIME",
          {
            defaultValue:
              envId === "dev" ||
              envId === "test" ||
              envId === "preprod" ||
              envId === "formation"
                ? CronExpression.EVERY_10_MINUTES
                : "0 15 * * TUE",
          }
        ),
        delay: configParser.parseDelay(
          x,

          "DOMIFA_CRON_EMAIL_USER_GUIDE_DELAY",

          {
            defaultValue:
              envId === "dev" ||
              envId === "test" ||
              envId === "preprod" ||
              envId === "formation"
                ? "5 minutes"
                : "7 days",
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
            defaultValue:
              envId === "dev" ||
              envId === "test" ||
              envId === "preprod" ||
              envId === "formation"
                ? CronExpression.EVERY_10_MINUTES
                : "0 15 * * TUE",
          }
        ),
        delay: configParser.parseDelay(
          x,
          "DOMIFA_CRON_EMAIL_IMPORT_GUIDE_DELAY",
          {
            defaultValue:
              envId === "dev" ||
              envId === "test" ||
              envId === "preprod" ||
              envId === "formation"
                ? "5 minutes"
                : "7 days",
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
          { defaultValue: envId === "test" ? false : true }
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
        enableSendImmadiately: false,
        crontime: configParser.parseString(
          x,
          "DOMIFA_CRON_SMS_CONSUMER_CRONTIME",
          {
            defaultValue: CronExpression.EVERY_10_MINUTES, //
          }
        ),
        autoRunOnStartup: false,
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
            defaultValue:
              envId === "dev" || envId === "test" ? "1 day" : "7 days",
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
