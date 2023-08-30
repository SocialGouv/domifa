import {
  userStructureRepository,
  userStructureSecurityEventHistoryManager,
  userStructureSecurityRepository,
} from "../..";
import { passwordGenerator } from "../../../../util/encoding/passwordGenerator.service";
import { PortailAdminUser } from "../../../../_common/model";
import { USER_ADMIN_WHERE } from "../userAdminRepository.service";

export const userAdminSecurityPasswordChecker = {
  checkPassword,
};

async function checkPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<PortailAdminUser> {
  const user: PortailAdminUser = await userStructureRepository.findOneBy({
    email: email.toLowerCase().trim(),
    ...USER_ADMIN_WHERE,
  });
  if (!user) {
    throw new Error("WRONG_CREDENTIALS"); // don't give the real cause
  }

  const userSecurity = await userStructureSecurityRepository.findOneBy({
    userId: user.id,
  });

  if (!userSecurity) {
    throw new Error("WRONG_CREDENTIALS"); // don't give the real cause
  }

  if (
    userStructureSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "login",
      ...userSecurity,
    })
  ) {
    throw new Error("WRONG_CREDENTIALS"); // don't give the real cause
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
    throw new Error("WRONG_CREDENTIALS"); // don't give the real cause
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

  return userStructureRepository.findOneBy({ id: user.id });
}
