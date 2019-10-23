import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

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
