import { Injectable, NotFoundException } from "@nestjs/common";
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
import { UserStatus, UserSupervisorRole } from "@domifa/common";

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
    };

    const userSecurity = await userSupervisorSecurityRepository.save(
      userSecurityAttributes
    );
    return { user, userSecurity };
  }

  public async unblockSupervisorUser(
    uuid: string
  ): Promise<{ userId: number }> {
    const target = await userSupervisorRepository.findOne({
      where: { uuid },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    await userSupervisorRepository.update(
      { id: target.id },
      { status: "ACTIVE" }
    );
    // Clear events history so the soft-lock (backoff) doesn't re-block the
    // account on the next login attempt — mirrors unblockStructureUser.
    const userSecurity = await userSupervisorSecurityRepository.findOneByOrFail(
      { userId: target.id }
    );
    await logUserSecurityEvent({
      userProfile: "supervisor",
      userId: target.id,
      userSecurity,
      eventType: "account-unblocked",
      clearAllEvents: true,
    });
    return { userId: target.id };
  }

  public async blockSupervisorUser(uuid: string): Promise<{
    userId: number;
    previousStatus: UserStatus;
    previousRole: UserSupervisorRole;
  }> {
    const target = await userSupervisorRepository.findOne({
      where: { uuid },
      select: { id: true, status: true, role: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    await userSupervisorRepository.update(
      { id: target.id },
      { status: "BLOCKED" }
    );
    return {
      userId: target.id,
      previousStatus: target.status,
      previousRole: target.role,
    };
  }
}
