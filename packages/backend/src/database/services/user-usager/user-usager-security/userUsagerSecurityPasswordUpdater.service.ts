import { userUsagerRepository, userUsagerSecurityRepository } from "..";
import { passwordGenerator } from "../../../../util/encoding/passwordGenerator.service";
import { UserUsager } from "../../../../_common/model";
import { userUsagerSecurityEventHistoryManager } from "./userUsagerSecurityEventHistoryManager.service";

export const userUsagerSecurityPasswordUpdater = {
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
  const userSecurity = await userUsagerSecurityRepository.findOne(
    {
      userId,
    },
    {
      throwErrorIfNotFound: true,
    }
  );

  if (
    userUsagerSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "change-password",
      ...userSecurity,
    })
  ) {
    throw new Error("Error");
  }
  const user = await userUsagerRepository.findOne<UserUsager>(
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
    await userUsagerSecurityRepository.logEvent({
      userId,
      userSecurity,
      eventType: "change-password-error",
    });
    throw new Error("Error");
  }

  const hash = await passwordGenerator.generatePasswordHash({
    password: newPassword,
  });

  await userUsagerRepository.updateOne(
    {
      id: userId,
    },
    {
      password: hash,
      passwordLastUpdate: new Date(),
    }
  );
  await userUsagerSecurityRepository.logEvent({
    userId,
    userSecurity,
    eventType: "change-password-success",
  });
}
