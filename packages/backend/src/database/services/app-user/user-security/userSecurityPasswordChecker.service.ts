import { userSecurityRepository, usersRepository } from "..";
import { passwordGenerator } from "../../../../util/encoding/passwordGenerator.service";
import { AppUser } from "../../../../_common/model";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";

export const userSecurityPasswordChecker = {
  checkPassword,
};

async function checkPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AppUser> {
  const user: AppUser = await usersRepository.findOne(
    {
      email: email.toLowerCase(),
    },
    {
      throwErrorIfNotFound: true,
      select: "ALL",
    }
  );
  const userSecurity = await userSecurityRepository.findOne(
    {
      userId: user.id,
    },
    {
      throwErrorIfNotFound: true,
    }
  );

  if (
    userSecurityEventHistoryManager.isAccountLockedForOperation({
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
    await userSecurityRepository.logEvent({
      userId: user.id,
      userSecurity,
      eventType: "login-error",
    });
    throw new Error("WRONG_CREDENTIALS"); // don't give the real cause
  }

  if (!user.verified) {
    throw new Error("ACCOUNT_NOT_ACTIVATED"); // don't give the real cause
  }

  await userSecurityRepository.logEvent({
    userId: user.id,
    userSecurity,
    eventType: "login-success",
  });

  return usersRepository.updateOne(
    {
      id: user.id,
    },
    {
      lastLogin: new Date(),
    }
  );
}
