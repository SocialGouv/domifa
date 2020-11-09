import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { appLogger } from "../util";
import { DomifaEnvId, DOMIFA_ENV_IDS } from "./model";

export type DomifaConfigKey =
  | "DB_HOST"
  | "DB_PASS"
  | "DB_PORT"
  | "DB_USER"
  | "DB_NAME"
  | "DB_AUTH_SOURCE"
  | "FILES_IV"
  | "FILES_PRIVATE"
  | "DOMIFA_CORS_URL"
  | "DOMIFA_FRONTEND_URL"
  | "DOMIFA_BACKEND_URL"
  | "SECRET"
  | "UPLOADS_FOLDER"
  | "DOMIFA_ENV_ID"
  | "DOMIFA_MONGOOSE_DEBUG"
  | "DOMIFA_SWAGGER_ENABLE"
  | "DOMIFA_CRON_ENABLED"
  | "DOMIFA_EMAILS_ENABLE"
  | "DOMIFA_ADMIN_EMAIL"
  | "DOMIFA_TIPIMAIL_FROM_EMAIL"
  | "DOMIFA_GENERATE_STATS_ON_STARTUP"
  | "POSTGRES_HOST"
  | "POSTGRES_PORT"
  | "POSTGRES_USERNAME"
  | "POSTGRES_PASSWORD"
  | "POSTGRES_DATABASE"
  | "TS_NODE_DEV"; // is running in typescript or javascript

export const configService = {
  loadConfig,
  get,
  getBoolean,
  getInteger,
  getEnvId,
};

let envConfig: { [key: string]: string } = null;

function loadConfig() {
  const envFile =
    process.env.NODE_ENV === "tests-local"
      ? ".env.backend.test.local"
      : process.env.NODE_ENV === "tests-travis"
      ? ".env.backend.test.travis"
      : ".env";
  const envFilePath = path.join(__dirname, "../../", envFile);

  if (!fs.existsSync(envFilePath)) {
    appLogger.warn(`[configService] Env file ${envFilePath} not found`);
  } else {
    appLogger.warn(`[configService] Loading config file "${envFilePath}"`);
  }

  const { error, parsed } = dotenv.config({ path: envFile });
  if (error) {
    appLogger.error(`[configService] Error loading env file ${envFilePath}`, {
      error,
      sentry: true,
    });
  }
  envConfig = {
    ...process.env,
    ...parsed, // override process.env from ${envFile}
  };

  checkConfig();
}

function get<T extends string = string>(key: DomifaConfigKey): T {
  if (!envConfig) {
    loadConfig();
  }
  return envConfig[key] as T;
}

function getBoolean(key: DomifaConfigKey): boolean {
  if (!envConfig) {
    loadConfig();
  }
  const value = envConfig[key];
  return !!value && value.trim() === "true";
}

function getInteger(key: DomifaConfigKey): number {
  if (!envConfig) {
    loadConfig();
  }
  const value = envConfig[key];
  if (value !== undefined) {
    return parseInt(value.trim(), 10);
  }
  return undefined;
}

function getEnvId(): DomifaEnvId {
  return get("DOMIFA_ENV_ID");
}

function checkConfig() {
  // check env id
  const envId = getEnvId();
  if (!DOMIFA_ENV_IDS.includes(envId)) {
    appLogger.error(
      `[ConfigService] invalid env id "${envId}" (allowed: ${DOMIFA_ENV_IDS.map(
        (x) => `"${x}"`
      ).join(",")})`
    );
    throw new Error("Invalid env id");
  }
}
