import * as dotenv from "dotenv";

import { existsSync } from "fs";
import { join } from "path";
import { DomifaEnv } from "./model";

export const domifaConfigFileLoader = {
  loadEnvFile,
};

function loadEnvFile(envFileName: string): Partial<DomifaEnv> {
  // NOTE:
  // - In ts-jest / TS runtime, __dirname points to ".../packages/backend/src/config",
  //   so backend root is 3 levels up.
  // - In compiled JS runtime, __dirname points to ".../packages/backend/dist/config",
  //   so backend root is 2 levels up.
  // We try both to keep the loader robust.
  const candidates = [
    join(__dirname, "../../", envFileName),
    join(__dirname, "../../../", envFileName),
  ];

  const envFilePath = candidates.find((p) => existsSync(p));

  // On laisse l'usage sync, car ce fichier n'est loadé qu'une fois
  if (!envFilePath) {
    // eslint:disable-next-line: no-console
    console.warn(
      `[configService] Env file not found (tried: ${candidates.join(
        ", "
      )}): ignoring`
    );
    return {} as unknown as Partial<DomifaEnv>;
  }

  const { error, parsed } = dotenv.config({ path: envFilePath });
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
