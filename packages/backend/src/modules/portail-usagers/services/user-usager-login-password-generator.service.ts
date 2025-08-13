import { format } from "date-fns";
import { userUsagerRepository } from "../../../database";
import { tokenGenerator } from "../../../util";
import { passwordGenerator } from "../../../util/encoding/passwordGenerator.service";
import { Usager } from "@domifa/common";

const CHARS_NUMBERS = "0123456789";
const CHARS_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const userUsagerLoginPasswordGenerator = {
  generateUniqueLogin,
  generateTemporyPassword,
};

async function generateUniqueLogin() {
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

    const alreadyExists = await userUsagerRepository.findOneBy({
      login,
    });
    newLoginAccepted = !alreadyExists;

    i++;
    if (i > 100) {
      throw new Error("generateUniqueLogin: too much recursion");
    }
  }

  return login;
}

async function generateTemporyPassword(
  usager?: Pick<Usager, "dateNaissance">
): Promise<{
  salt: string;
  temporaryPassword: string;
  isBirthDate: boolean;
  passwordHash: string;
}> {
  const salt = await passwordGenerator.generateSalt({ length: 10 });
  let isBirthDate = false;
  let temporaryPassword = "";
  if (usager?.dateNaissance) {
    isBirthDate = true;
    temporaryPassword = format(usager.dateNaissance, "ddMMyyyy");
  } else {
    temporaryPassword = tokenGenerator.generateString({
      length: 8,
      charsToInclude: CHARS_NUMBERS,
    });
  }

  const passwordHash = await passwordGenerator.generatePasswordHash({
    password: temporaryPassword,
    salt,
  });

  return { salt, temporaryPassword, passwordHash, isBirthDate };
}
