import { UserUsager } from "@domifa/common";
import {
  userUsagerRepository,
  userUsagerSecurityRepository,
} from "../../../../database";
import { passwordGenerator } from "../../../../util";
import { userUsagerSecurityPasswordUpdater } from "./userUsagerSecurityPasswordUpdater.service";
import {
  logUserSecurityEvent,
  userSecurityEventHistoryManager,
} from "../../../users/services";

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
  const user = await userUsagerRepository.findOne({
    where: {
      login: login.toUpperCase(),
    },
    select: {
      password: true,
      salt: true,
      id: true,
    },
  });

  if (!user) {
    throw new Error("WRONG_CREDENTIALS 8"); // don't give the real cause
  }

  const userSecurity = await userUsagerSecurityRepository.findOneOrFail({
    where: { userId: user.id },
  });

  if (
    userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "login",
      ...userSecurity,
    })
  ) {
    throw new Error("TOO_MANY_ATTEMPTS");
  }

  const isValidPass: boolean = await passwordGenerator.checkPassword({
    password,
    hash: user.password,
  });

  if (!isValidPass) {
    await logUserSecurityEvent({
      userProfile: "usager",
      userId: user.id,
      userSecurity,
      eventType: "login-error",
    });
    throw new Error("WRONG_CREDENTIALS 9"); // don't give the real cause
  }

  await logUserSecurityEvent({
    userProfile: "usager",
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
    await userUsagerRepository.update(
      {
        id: user.id,
      },
      {
        lastLogin: new Date(),
        passwordType: "PERSONAL",
        passwordLastUpdate: new Date(),
      }
    );
  } else {
    await userUsagerRepository.update(
      {
        id: user.id,
      },
      {
        lastLogin: new Date(),
      }
    );
  }

  return userUsagerRepository.findOneBy({
    id: user.id,
  });
}
