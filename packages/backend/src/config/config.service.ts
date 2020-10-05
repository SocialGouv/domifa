import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";

@Injectable()
export class ConfigService {
  private readonly envConfig: any;

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
    };
  }

  public get(key: string): string {
    return this.envConfig[key];
  }
}
