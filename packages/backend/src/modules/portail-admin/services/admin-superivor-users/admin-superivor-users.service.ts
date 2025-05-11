import { Injectable } from "@nestjs/common";
import { UserSupervisorTable } from "../../../../database/entities/user-supervisor";
import { UserSecurity } from "../../../../_common/model";
import {
  userSupervisorSecurityRepository,
  userSupervisorRepository,
} from "../../../../database";
import { passwordGenerator } from "../../../../util";
import { userSecurityResetPasswordInitiator } from "../../../users/services";
import { RegisterUserSupervisorDto } from "../../dto";

@Injectable()
export class AdminSuperivorUsersService {
  public async createUserWithTmpToken(
    userDto: RegisterUserSupervisorDto
  ): Promise<{ user: UserSupervisorTable; userSecurity: UserSecurity }> {
    const createdUser = new UserSupervisorTable(userDto);

    createdUser.verified = true;
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
}
