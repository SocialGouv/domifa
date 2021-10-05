import { userStructureRepository, userStructureSecurityRepository } from "..";
import { passwordGenerator } from "../../../../util/encoding/passwordGenerator.service";
import { UserStructure } from "../../../../_common/model";
import { userStructureSecurityEventHistoryManager } from "./userStructureSecurityEventHistoryManager.service";

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
  const user: UserStructure = await userStructureRepository.findOne(
    {
      email: email.toLowerCase(),
    },
    {
      throwErrorIfNotFound: true,
      select: "ALL",
    }
  );

  const userSecurity = await userStructureSecurityRepository.findOne(
    {
      userId: user.id,
    },
    {
      throwErrorIfNotFound: true,
    }
  );

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
  return userStructureRepository.updateOne(
    {
      id: user.id,
    },
    {
      lastLogin: new Date(),
    }
  );
}
