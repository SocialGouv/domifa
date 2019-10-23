import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";

@Injectable()
export class ConfigService {
  private readonly envConfig: any;

  constructor() {
    dotenv.config();

    this.envConfig = {
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      API_URL: process.env.API_URL,
      DB_HOST: process.env.DB_HOST,
      DB_PASS: process.env.DB_PASS,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      FRONT_URL: process.env.FRONT_URL,
      MJ_APIKEY_PRIVATE: process.env.MJ_APIKEY_PRIVATE,
      MJ_APIKEY_PUBLIC: process.env.MJ_APIKEY_PUBLIC,
      SECRET: process.env.SECRET
    };
  }

  public get(key: string): string {
    return this.envConfig[key];
  }
}
