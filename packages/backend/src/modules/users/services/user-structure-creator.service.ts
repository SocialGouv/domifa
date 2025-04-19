import {
  userStructureRepository,
  userStructureSecurityRepository,
  UserStructureTable,
} from "../../../database";
import { passwordGenerator } from "../../../util/encoding/passwordGenerator.service";
import { UserSecurity } from "../../../_common/model";
import { RegisterUserStructureAdminDto } from "../../portail-admin/dto/register-user-structure-admin.dto";
import { UserDto } from "../dto/user.dto";
import { UserStructureRole } from "@domifa/common";
import { userSecurityResetPasswordInitiator } from "./userSecurityResetPasswordInitiator.service";

export const userStructureCreator = {
  createUserWithPassword,
  createUserWithTmpToken,
};

async function createUserWithPassword(
  userDto: UserDto,
  {
    role,
    structureId,
    firstAccount,
  }: {
    role: UserStructureRole;
    structureId: number;
    firstAccount?: boolean;
  }
): Promise<{ user: UserStructureTable; userSecurity: UserSecurity }> {
  const createdUser = new UserStructureTable(userDto);
  createdUser.structureId = structureId;
  createdUser.acceptTerms = firstAccount ? new Date() : null;
  createdUser.role = role;
  createdUser.verified = false;
  createdUser.password = await passwordGenerator.generatePasswordHash({
    password: createdUser.password,
  });
  createdUser.passwordLastUpdate = new Date();
  const user = await userStructureRepository.save(createdUser);

  const userSecurityAttributes: UserSecurity = {
    userId: user.id,
    eventsHistory: [],
    temporaryTokens: undefined,
  };

  const userSecurity = await userStructureSecurityRepository.save(
    userSecurityAttributes
  );
  return { user, userSecurity };
}

async function createUserWithTmpToken(
  userDto: RegisterUserStructureAdminDto
): Promise<{ user: UserStructureTable; userSecurity: UserSecurity }> {
  const createdUser = new UserStructureTable(userDto);

  createdUser.verified = true;
  createdUser.password = await passwordGenerator.generateRandomPasswordHash();

  const user = await userStructureRepository.save(createdUser);

  const userSecurityAttributes: UserSecurity = {
    userId: user.id,
    temporaryTokens:
      userSecurityResetPasswordInitiator.generateResetPasswordTokenAndValidity({
        type: "create-user",
      }),
    eventsHistory: [],
  };

  const userSecurity = await userStructureSecurityRepository.save(
    userSecurityAttributes
  );
  return { user, userSecurity };
}
