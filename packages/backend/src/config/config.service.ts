import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";

@Injectable()
export class ConfigService {
  private readonly envConfig: any;

  constructor() {
    this.envConfig = dotenv.config().parsed;
  }

  public get(key: string): string {
    return this.envConfig[key];
  }
}
