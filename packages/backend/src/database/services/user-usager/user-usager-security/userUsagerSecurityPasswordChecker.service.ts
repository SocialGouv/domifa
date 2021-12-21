import { userUsagerSecurityPasswordUpdater } from ".";
import { userUsagerRepository, userUsagerSecurityRepository } from "..";
import { passwordGenerator } from "../../../../util/encoding/passwordGenerator.service";
import { UserUsager } from "../../../../_common/model";
import { userUsagerSecurityEventHistoryManager } from "./userUsagerSecurityEventHistoryManager.service";

export const userUsagerSecurityPasswordChecker = {
  checkPassword,
};

async function checkPassword({
  login,
  password,
  newPassword,
}: {
  login: string;
  password: string;
  newPassword: string;
}): Promise<UserUsager> {
  const user = await userUsagerRepository.findOne<
    Pick<UserUsager, "password" | "salt" | "id" | "enabled">
  >(
    {
      login: login.toUpperCase(),
    },
    {
      throwErrorIfNotFound: true,
      select: ["password", "salt", "id", "enabled"],
    }
  );

  const userSecurity = await userUsagerSecurityRepository.findOne(
    {
      userId: user.id,
    },
    {
      throwErrorIfNotFound: true,
    }
  );

  if (
    userUsagerSecurityEventHistoryManager.isAccountLockedForOperation({
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
    await userUsagerSecurityRepository.logEvent({
      userId: user.id,
      userSecurity,
      eventType: "login-error",
    });
    throw new Error("WRONG_CREDENTIALS"); // don't give the real cause
  }

  if (!user.enabled) {
    throw new Error("ACCOUNT_NOT_ACTIVATED");
  }

  await userUsagerSecurityRepository.logEvent({
    userId: user.id,
    userSecurity,
    eventType: "login-success",
  });
  if (newPassword) {
    // update password
    await userUsagerSecurityPasswordUpdater.updatePassword({
      userId: user.id,
      oldPassword: password,
      newPassword,
    });
    return userUsagerRepository.updateOne(
      {
        id: user.id,
      },
      {
        lastLogin: new Date(),
        isTemporaryPassword: false,
        passwordLastUpdate: new Date(),
      }
    );
  } else {
    return userUsagerRepository.updateOne(
      {
        id: user.id,
      },
      {
        lastLogin: new Date(),
      }
    );
  }
}
