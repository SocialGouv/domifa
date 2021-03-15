import {
  AppUserTable,
  userSecurityRepository,
  userSecurityResetPasswordInitiator,
  usersRepository,
} from "../../database";
import { passwordGenerator } from "../../util/encoding/passwordGenerator.service";
import { AppUserSecurity, UserRole } from "../../_common/model";
import { RegisterUserAdminDto } from "../dto/register-user-admin.dto";
import { UserDto } from "../dto/user.dto";

export const usersCreator = {
  createUserWithPassword,
  createUserWithTmpToken,
};

async function createUserWithPassword(
  userDto: UserDto,
  {
    role,
    structureId,
  }: {
    role: UserRole;
    structureId: number;
  }
): Promise<{ user: AppUserTable; userSecurity: AppUserSecurity }> {
  const createdUser = new AppUserTable(userDto);
  createdUser.structureId = structureId;
  createdUser.role = role;
  createdUser.verified = false;
  createdUser.password = await passwordGenerator.generatePasswordHash({
    password: createdUser.password,
  });
  createdUser.passwordLastUpdate = new Date();
  const user = await usersRepository.save(createdUser);

  const userSecurityAttributes: AppUserSecurity = {
    userId: user.id,
    structureId: user.structureId,
    eventsHistory: [],
    temporaryTokens: undefined,
  };

  const userSecurity = await userSecurityRepository.save(
    userSecurityAttributes
  );
  return { user, userSecurity };
}

async function createUserWithTmpToken(
  userDto: RegisterUserAdminDto
): Promise<{ user: AppUserTable; userSecurity: AppUserSecurity }> {
  const createdUser = new AppUserTable(userDto);

  createdUser.verified = true;
  createdUser.password = await passwordGenerator.generateRandomPasswordHash();

  const user = await usersRepository.save(createdUser);

  const userSecurityAttributes: AppUserSecurity = {
    userId: user.id,
    structureId: user.structureId,
    temporaryTokens: userSecurityResetPasswordInitiator.generateResetPasswordTokenAndValidity(
      { type: "create-user" }
    ),
    eventsHistory: [],
  };

  const userSecurity = await userSecurityRepository.save(
    userSecurityAttributes
  );
  return { user, userSecurity };
}
