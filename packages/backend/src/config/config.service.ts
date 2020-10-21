import { Injectable, Logger } from "@nestjs/common";
import * as dotenv from "dotenv";
import { appLogger } from "../util";
import { DomifaEnvId, DOMIFA_ENV_IDS } from "./model";

export type DomifaConfigKey =
  | "DB_HOST"
  | "DB_PASS"
  | "DB_PORT"
  | "DB_USER"
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
@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    dotenv.config();
    this.envConfig = {
      ...process.env,
    };
    this.checkConfig();
  }

  public get<T extends string = string>(key: DomifaConfigKey): T {
    return this.envConfig[key] as T;
  }

  public getBoolean(key: DomifaConfigKey): boolean {
    const value = this.envConfig[key];
    return !!value && value.trim() === "true";
  }

  public getEnvId(): DomifaEnvId {
    return this.get("DOMIFA_ENV_ID");
  }

  private checkConfig() {
    // check env id
    const envId = this.getEnvId();
    if (!DOMIFA_ENV_IDS.includes(envId)) {
      appLogger.error(
        `[ConfigService] invalid env id "${envId}" (allowed: ${DOMIFA_ENV_IDS.map(
          (x) => `"${x}"`
        ).join(",")})`
      );
      throw new Error("Invalid env id");
    }
  }
}
