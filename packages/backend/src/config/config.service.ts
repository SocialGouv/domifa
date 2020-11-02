import * as dotenv from "dotenv";
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
  | "DOMIFA_TIPIMAIL_FROM_EMAIL";

export const configService = {
  loadConfig,
  get,
  getBoolean,
  getEnvId,
};

let envConfig: { [key: string]: string } = null;

function loadConfig() {
  const envFile = process.env.NODE_ENV === "tests" ? ".tests.env" : ".env";
  dotenv.config({ path: envFile });
  dotenv.config();
  envConfig = {
    ...process.env,
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
