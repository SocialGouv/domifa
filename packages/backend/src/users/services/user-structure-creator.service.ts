import {
  userStructureRepository,
  userStructureSecurityRepository,
  userStructureSecurityResetPasswordInitiator,
  UserStructureTable,
} from "../../database";
import { passwordGenerator } from "../../util/encoding/passwordGenerator.service";
import { UserStructureSecurity } from "../../_common/model";
import { RegisterUserAdminDto } from "../dto/register-user-admin.dto";
import { UserDto } from "../dto/user.dto";
import { UserStructureRole } from "@domifa/common";

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
): Promise<{ user: UserStructureTable; userSecurity: UserStructureSecurity }> {
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

  const userSecurityAttributes: UserStructureSecurity = {
    userId: user.id,
    structureId: user.structureId,
    eventsHistory: [],
    temporaryTokens: undefined,
  };

  const userSecurity = await userStructureSecurityRepository.save(
    userSecurityAttributes
  );
  return { user, userSecurity };
}

async function createUserWithTmpToken(
  userDto: RegisterUserAdminDto
): Promise<{ user: UserStructureTable; userSecurity: UserStructureSecurity }> {
  const createdUser = new UserStructureTable(userDto);

  createdUser.verified = true;
  createdUser.password = await passwordGenerator.generateRandomPasswordHash();

  const user = await userStructureRepository.save(createdUser);

  const userSecurityAttributes: UserStructureSecurity = {
    userId: user.id,
    structureId: user.structureId,
    temporaryTokens:
      userStructureSecurityResetPasswordInitiator.generateResetPasswordTokenAndValidity(
        {
          type: "create-user",
        }
      ),
    eventsHistory: [],
  };

  const userSecurity = await userStructureSecurityRepository.save(
    userSecurityAttributes
  );
  return { user, userSecurity };
}
