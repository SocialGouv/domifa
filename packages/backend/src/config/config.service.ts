import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    this.envConfig = dotenv.parse(
      fs.readFileSync(path.resolve(__dirname, "config.env"))
    );
  }

  public get(key: string): string {
    return this.envConfig[key];
  }
}
