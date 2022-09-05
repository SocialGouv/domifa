import { USER_ADMIN_WHERE } from "./../UserAdminRepository.service";
import {
  UserAdminRepository,
  userStructureRepository,
  userStructureSecurityEventHistoryManager,
  UserStructureSecurityRepository,
} from "../..";
import { passwordGenerator } from "../../../../util/encoding/passwordGenerator.service";
import { PortailAdminUser } from "../../../../_common/model";

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
  const user: PortailAdminUser = await UserAdminRepository.findOneBy({
    email: email.toLowerCase(),
    ...USER_ADMIN_WHERE,
  });

  const userSecurity = await UserStructureSecurityRepository.findOneBy({
    userId: user.id,
  });

  if (!user || !userSecurity) {
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
    await UserStructureSecurityRepository.logEvent({
      userId: user.id,
      userSecurity,
      eventType: "login-error",
    });
    throw new Error("WRONG_CREDENTIALS"); // don't give the real cause
  }

  if (!user.verified) {
    throw new Error("ACCOUNT_NOT_ACTIVATED");
  }

  await UserStructureSecurityRepository.logEvent({
    userId: user.id,
    userSecurity,
    eventType: "login-success",
  });

  await userStructureRepository.updateOne(
    {
      id: user.id,
    },
    {
      lastLogin: new Date(),
    }
  );
  return userStructureRepository.findOne({ id: user.id });
}
