import { userSecurityRepository, usersRepository } from "..";
import { passwordGenerator } from "../../../../util/encoding/passwordGenerator.service";
import { AppUser } from "../../../../_common/model";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";

export const userSecurityPasswordUpdater = {
  updatePassword,
};

async function updatePassword({
  userId,
  oldPassword,
  newPassword,
}: {
  userId: number;
  oldPassword: string;
  newPassword: string;
}): Promise<void> {
  const userSecurity = await userSecurityRepository.findOne(
    {
      userId: userId,
    },
    {
      throwErrorIfNotFound: true,
    }
  );

  if (
    userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "change-password",
      ...userSecurity,
    })
  ) {
    throw new Error("Error");
  }
  const user = await usersRepository.findOne<AppUser>(
    {
      id: userId,
    },
    {
      select: "ALL",
      throwErrorIfNotFound: true,
    }
  );
  const isValidPass: boolean = await passwordGenerator.checkPassword({
    password: oldPassword,
    hash: user.password,
  });
  if (!isValidPass) {
    await userSecurityRepository.logEvent({
      userId,
      userSecurity,
      eventType: "change-password-error",
    });
    throw new Error("Error");
  }

  const hash = await passwordGenerator.generatePasswordHash({
    password: newPassword,
  });

  await usersRepository.updateOne(
    {
      id: userId,
    },
    {
      password: hash,
      passwordLastUpdate: new Date(),
    }
  );
  await userSecurityRepository.logEvent({
    userId,
    userSecurity,
    eventType: "change-password-success",
  });
}
