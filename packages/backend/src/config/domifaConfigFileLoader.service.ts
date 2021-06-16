import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { DomifaEnv } from "./model";
import SMTPTransport = require("nodemailer/lib/smtp-transport");

export const domifaConfigFileLoader = {
  loadEnvFile,
};

function loadEnvFile(envFileName: string): Partial<DomifaEnv> {
  const envFilePath = path.join(__dirname, "../../", envFileName);

  if (!fs.existsSync(envFilePath)) {
    // tslint:disable-next-line: no-console
    console.warn(`[configService] Env file ${envFilePath} not found: ignoring`);
    return {} as unknown as Partial<DomifaEnv>;
  } else {
    const { error, parsed } = dotenv.config({ path: envFileName });
    if (error) {
      // tslint:disable-next-line: no-console
      console.error(`[configService] Error loading env file ${envFilePath}`, {
        error,
        sentry: true,
      });
    }
    return {
      ...parsed,
    } as unknown as Partial<DomifaEnv>;
  }
}
