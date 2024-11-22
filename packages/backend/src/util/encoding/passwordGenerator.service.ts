import { compare, genSalt, hash } from "bcryptjs";
import { tokenGenerator } from "./tokenGenerator.service";
import { appLogger } from "../logs";

export const passwordGenerator = {
  generateSalt,
  generatePasswordHash,
  generateRandomPasswordHash,
  checkPassword,
};

function generateSalt({ length }: { length: number }): Promise<string> {
  return genSalt(length);
}

async function generateRandomPasswordHash(
  {
    salt = 10,
  }: {
    salt?: string | number;
  } = { salt: 10 }
): Promise<string> {
  const password = tokenGenerator.generateToken({ length: 30 });

  return await generatePasswordHash({ password, salt });
}

async function generatePasswordHash({
  password,
  salt = 10,
}: {
  password: string;
  salt?: string | number;
}): Promise<string> {
  try {
    return await hash(password, salt);
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
    return await compare(password, hash);
  } catch (err) {
    appLogger.error("Unexpected error checking password", {
      error: err as Error,
      sentry: true,
    });
    return false;
  }
}
