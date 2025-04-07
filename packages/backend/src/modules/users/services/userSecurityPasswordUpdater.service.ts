import { UserProfile } from "../../../_common/model";
import { passwordGenerator } from "../../../util";
import {
  getUserRepository,
  getUserSecurityRepository,
} from "./get-user-repository.service";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";

export const userStructureSecurityPasswordUpdater = {
  updatePassword,
};
async function updatePassword({
  userId,
  oldPassword,
  newPassword,
  userProfile,
}: {
  userId: number;
  oldPassword: string;
  newPassword: string;
  userProfile: UserProfile;
}): Promise<void> {
  const repository = getUserRepository(userProfile);
  const securityRepository = getUserSecurityRepository(userProfile);

  const userSecurity = await securityRepository.findOneByOrFail({
    userId,
  });

  if (
    userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "change-password",
      ...userSecurity,
    })
  ) {
    throw new Error("Error");
  }

  const user = await repository.findOneByOrFail({
    id: userId,
  });

  const isValidPass: boolean = await passwordGenerator.checkPassword({
    password: oldPassword,
    hash: user.password,
  });

  if (!isValidPass) {
    await securityRepository.logEvent({
      userId,
      userSecurity,
      eventType: "change-password-error",
    });
    throw new Error("Error");
  }

  const hash = await passwordGenerator.generatePasswordHash({
    password: newPassword,
  });

  await repository.update(
    {
      id: userId,
    },
    {
      password: hash,
      passwordLastUpdate: new Date(),
      verified: true, // Suite à une création de compte, le mot de passe est réinitialisé, on valide le compte
    }
  );

  await securityRepository.logEvent({
    userId,
    userSecurity,
    eventType: "change-password-success",
  });
}
