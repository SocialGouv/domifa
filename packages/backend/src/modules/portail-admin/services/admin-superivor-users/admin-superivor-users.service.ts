import { Injectable } from "@nestjs/common";
import { UserSupervisorTable } from "../../../../database/entities/user-supervisor";
import { UserSecurity } from "../../../../_common/model";
import {
  userSupervisorSecurityRepository,
  userSupervisorRepository,
} from "../../../../database";
import { passwordGenerator } from "../../../../util";
import {
  logUserSecurityEvent,
  userSecurityResetPasswordInitiator,
} from "../../../users/services";
import { RegisterUserSupervisorDto } from "../../dto";

@Injectable()
export class AdminSuperivorUsersService {
  public async createUserWithTmpToken(
    userDto: RegisterUserSupervisorDto
  ): Promise<{ user: UserSupervisorTable; userSecurity: UserSecurity }> {
    const createdUser = new UserSupervisorTable(userDto);

    createdUser.status = "ACTIVE";
    createdUser.password = await passwordGenerator.generateRandomPasswordHash();

    const user = await userSupervisorRepository.save(createdUser);

    const userSecurityAttributes: UserSecurity = {
      userId: user.id,
      temporaryTokens:
        userSecurityResetPasswordInitiator.generateResetPasswordTokenAndValidity(
          {
            type: "create-user",
          }
        ),
      eventsHistory: [],
    };

    const userSecurity = await userSupervisorSecurityRepository.save(
      userSecurityAttributes
    );
    return { user, userSecurity };
  }

  public async unblockSupervisorUser(userId: number): Promise<void> {
    await userSupervisorRepository.update({ id: userId }, { status: "ACTIVE" });
    // Clear events history so the soft-lock (backoff) doesn't re-block the
    // account on the next login attempt — mirrors unblockStructureUser.
    const userSecurity = await userSupervisorSecurityRepository.findOneByOrFail(
      { userId }
    );
    await logUserSecurityEvent({
      userProfile: "supervisor",
      userId,
      userSecurity,
      eventType: "account-unblocked",
      clearAllEvents: true,
    });
  }
}
