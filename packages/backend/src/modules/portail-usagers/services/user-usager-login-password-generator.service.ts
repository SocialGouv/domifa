import { format } from "date-fns";
import { userUsagerRepository } from "../../../database";
import { tokenGenerator } from "../../../util";
import { passwordGenerator } from "../../../util/encoding/passwordGenerator.service";

const CHARS_NUMBERS = "0123456789";
const CHARS_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const userUsagerLoginPasswordGenerator = {
  generateUniqueLogin,
  generateTemporyPassword,
};

async function generateUniqueLogin(
  {
    checkAlreadyExists,
    existingLogins,
  }: {
    checkAlreadyExists?: boolean;
    existingLogins?: Set<string>;
  } = {
    checkAlreadyExists: true,
  }
) {
  let newLoginAccepted = false;
  let login: string;
  let i = 0;

  while (!newLoginAccepted) {
    login = tokenGenerator
      .generateString({
        length: 8,
        charsToInclude: CHARS_LETTERS,
      })
      .toUpperCase();

    if (checkAlreadyExists) {
      if (existingLogins) {
        newLoginAccepted = !existingLogins.has(login);
      } else {
        const alreadyExists = await userUsagerRepository.findOneBy({
          login,
        });
        newLoginAccepted = !alreadyExists;
      }
    } else {
      newLoginAccepted = true;
    }

    i++;
    if (i > 1000) {
      throw new Error("generateUniqueLogin: too much recursion");
    }
  }

  return login;
}

async function generateTemporyPassword(
  temporaryPassword?: string,
  dateNaissance?: Date
): Promise<{
  salt: string;
  temporaryPassword: string;
  passwordHash: string;
}> {
  const salt = await passwordGenerator.generateSalt({ length: 10 });

  if (!temporaryPassword) {
    if (dateNaissance) {
      temporaryPassword = format(dateNaissance, "ddMMyyyy");
    } else {
      temporaryPassword = tokenGenerator.generateString({
        length: 8,
        charsToInclude: CHARS_NUMBERS,
      });
    }
  }

  const passwordHash = await passwordGenerator.generatePasswordHash({
    password: temporaryPassword,
    salt,
  });

  return { salt, temporaryPassword, passwordHash };
}
