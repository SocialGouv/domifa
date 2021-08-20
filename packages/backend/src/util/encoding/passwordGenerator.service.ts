import * as bcrypt from "bcryptjs";
import { appLogger } from "../AppLogger.service";
import { tokenGenerator } from "./tokenGenerator.service";
export const passwordGenerator = {
  generatePasswordHash,
  generateRandomPasswordHash,
  checkPassword,
};

async function generateRandomPasswordHash(
  {
    salt = 10,
  }: {
    salt?: string | number;
  } = { salt: 10 }
): Promise<string> {
  const password = tokenGenerator.generateToken({ length: 30 });

  return generatePasswordHash({ password, salt });
}

async function generatePasswordHash({
  password,
  salt = 10,
}: {
  password: string;
  salt?: string | number;
}): Promise<string> {
  try {
    return bcrypt.hash(password, salt);
  } catch (err) {
    appLogger.error("Unexpected error testing password", {
      error: err as Error,
      sentry: true,
    });
    throw err;
  }
}

async function checkPassword({
  hash,
  password,
}: {
  hash: string;
  password: string;
}): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    appLogger.error("Unexpected error checking password", {
      error: err as Error,
      sentry: true,
    });
    return false;
  }
}
