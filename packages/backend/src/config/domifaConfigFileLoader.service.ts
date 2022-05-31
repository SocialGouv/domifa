import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { DomifaEnv } from "./model";

export const domifaConfigFileLoader = {
  loadEnvFile,
};

function loadEnvFile(envFileName: string): Partial<DomifaEnv> {
  const envFilePath = path.join(__dirname, "../../", envFileName);

  // On laisse l'usage sync, car ce fichir n'est loadé qu'une fois
  if (!fs.existsSync(envFilePath)) {
    // eslint:disable-next-line: no-console
    console.warn(`[configService] Env file ${envFilePath} not found: ignoring`);
    return {} as unknown as Partial<DomifaEnv>;
  } else {
    const { error, parsed } = dotenv.config({ path: envFileName });
    if (error) {
      // eslint:disable-next-line: no-console
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
