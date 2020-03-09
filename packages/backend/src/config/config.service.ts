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
      FILES_IV: process.env.FILES_IV,
      FILES_PRIVATE: process.env.FILES_PRIVATE,
      FRONT_URL: process.env.FRONT_URL,
      IS_LOCAL: process.env.IS_LOCAL,
      MJ_APIKEY_PRIVATE: process.env.MJ_APIKEY_PRIVATE,
      MJ_APIKEY_PUBLIC: process.env.MJ_APIKEY_PUBLIC,
      SECRET: process.env.SECRET,
      UPLOADS_FOLDER: process.env.UPLOADS_FOLDER
    };
  }

  public get(key: string): string {
    return this.envConfig[key];
  }
}
