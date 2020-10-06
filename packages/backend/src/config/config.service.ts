import { Injectable, Logger } from "@nestjs/common";
import * as dotenv from "dotenv";
import { DomifaEnvId, DOMIFA_ENV_IDS } from "./model";

export type DomifaConfigKey =
  | "DB_HOST"
  | "DB_PASS"
  | "DB_PORT"
  | "DB_USER"
  | "DB_AUTH_SOURCE"
  | "FILES_IV"
  | "FILES_PRIVATE"
  | "DOMIFA_FRONTEND_URL"
  | "DOMIFA_BACKEND_URL"
  | "MJ_APIKEY_PRIVATE"
  | "MJ_APIKEY_PUBLIC"
  | "SECRET"
  | "UPLOADS_FOLDER"
  | "DOMIFA_ENV_ID"
  | "DOMIFA_MONGOOSE_DEBUG"
  | "DOMIFA_SWAGGER_ENABLE"
  | "DOMIFA_ADMIN_EMAIL"
  | "DOMIFA_FROM_EMAIL";

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    dotenv.config();
    this.envConfig = {
      DB_HOST: process.env.DB_HOST,
      DB_PASS: process.env.DB_PASS,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_AUTH_SOURCE: process.env.DB_AUTH_SOURCE,
      FILES_IV: process.env.FILES_IV,
      FILES_PRIVATE: process.env.FILES_PRIVATE,
      DOMIFA_FRONTEND_URL: process.env.DOMIFA_FRONTEND_URL,
      DOMIFA_BACKEND_URL: process.env.DOMIFA_BACKEND_URL,
      MJ_APIKEY_PRIVATE: process.env.MJ_APIKEY_PRIVATE,
      MJ_APIKEY_PUBLIC: process.env.MJ_APIKEY_PUBLIC,
      SECRET: process.env.SECRET,
      UPLOADS_FOLDER: process.env.UPLOADS_FOLDER,
      DOMIFA_ENV_ID: process.env.DOMIFA_ENV_ID || "",
      DOMIFA_MONGOOSE_DEBUG: process.env.DOMIFA_MONGOOSE_DEBUG,
      DOMIFA_SWAGGER_ENABLE: process.env.DOMIFA_SWAGGER_ENABLE,
      DOMIFA_ADMIN_EMAIL: process.env.DOMIFA_ADMIN_EMAIL,
      DOMIFA_FROM_EMAIL: process.env.DOMIFA_FROM_EMAIL,
    };
    this.checkConfig();
  }

  public get<T extends string = string>(key: DomifaConfigKey): T {
    return this.envConfig[key] as T;
  }

  public getEnvId(): DomifaEnvId {
    return this.get("DOMIFA_ENV_ID");
  }

  private checkConfig() {
    // check env id
    const envId = this.getEnvId();
    if (!DOMIFA_ENV_IDS.includes(envId)) {
      Logger.error(
        `[ConfigService] invalid env id "${envId}" (allowed: ${DOMIFA_ENV_IDS.map(
          (x) => `"${x}"`
        ).join(",")})`
      );
      throw new Error("Invalid env id");
    }
  }
}
