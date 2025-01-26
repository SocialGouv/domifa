import { UserStructure } from "@domifa/common";
import { passwordGenerator } from "../../../../util";
import { userStructureRepository } from "../../user-structure";
import { userStructureSecurityEventHistoryManager } from "./userStructureSecurityEventHistoryManager.service";
import { userStructureSecurityRepository } from "./userStructureSecurityRepository.service";

export const userStructureSecurityPasswordChecker = {
  checkPassword,
};

async function checkPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<UserStructure> {
  const user: UserStructure = await userStructureRepository.findOneByOrFail({
    email: email.toLowerCase(),
  });

  const userSecurity = await userStructureSecurityRepository.findOneBy({
    userId: user.id,
  });

  if (!user || !userSecurity) {
    throw new Error("WRONG_CREDENTIALS 1"); // don't give the real cause
  }

  if (
    userStructureSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "login",
      ...userSecurity,
    })
  ) {
    throw new Error("WRONG_CREDENTIALS 2"); // don't give the real cause
  }

  const isValidPass: boolean = await passwordGenerator.checkPassword({
    password,
    hash: user.password,
  });

  if (!isValidPass) {
    await userStructureSecurityRepository.logEvent({
      userId: user.id,
      userSecurity,
      eventType: "login-error",
    });
    throw new Error("WRONG_CREDENTIALS 3"); // don't give the real cause
  }

  if (!user.verified) {
    throw new Error("ACCOUNT_NOT_ACTIVATED");
  }

  await userStructureSecurityRepository.logEvent({
    userId: user.id,
    userSecurity,
    eventType: "login-success",
  });

  await userStructureRepository.update(
    { id: user.id },
    { lastLogin: new Date() }
  );

  return userStructureRepository.findOneBy({
    id: user.id,
  });
}
