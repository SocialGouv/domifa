import {
  userStructureRepository,
  UserStructureSecurityRepository,
} from "../../user-structure";
import { passwordGenerator } from "../../../../util/encoding/passwordGenerator.service";
import { UserStructure } from "../../../../_common/model";
import { userStructureSecurityEventHistoryManager } from "./userStructureSecurityEventHistoryManager.service";

export const userStructureSecurityPasswordUpdater = {
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
  const userSecurity = await UserStructureSecurityRepository.findOneByOrFail({
    userId,
  });

  if (
    userStructureSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "change-password",
      ...userSecurity,
    })
  ) {
    throw new Error("Error");
  }
  const user = await userStructureRepository.findOne<UserStructure>(
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
    await UserStructureSecurityRepository.logEvent({
      userId,
      userSecurity,
      eventType: "change-password-error",
    });
    throw new Error("Error");
  }

  const hash = await passwordGenerator.generatePasswordHash({
    password: newPassword,
  });

  await userStructureRepository.updateOne(
    {
      id: userId,
    },
    {
      password: hash,
      passwordLastUpdate: new Date(),
      verified: true, // Suite à une création de compte, le mot de passe est réinitialisé, on valide le compte
    }
  );
  await UserStructureSecurityRepository.logEvent({
    userId,
    userSecurity,
    eventType: "change-password-success",
  });
}
