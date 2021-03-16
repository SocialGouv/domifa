import { Connection } from "typeorm";
import { userSecurityRepository } from "../../database";
import { passwordGenerator } from "../../util/encoding/passwordGenerator.service";
import { AppTestHelper } from "../../util/test";
import { UserRole } from "../../_common/model";
import { RegisterUserAdminDto } from "../dto/register-user-admin.dto";
import { UserDto } from "../dto/user.dto";
import { usersCreator } from "./users-creator.service";
import { usersDeletor } from "./users-deletor.service";

describe("UsersCreator", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("createUserWithPassword", async () => {
    const structureId = 2;
    const role: UserRole = "facteur";
    const password = "?p@sw$rd!";
    const userAttributes: UserDto = {
      email: "newUser1@test.com",
      nom: "Smith",
      prenom: "Tom",
      password,
      phone: "0102030405",

      structureId,
    };
    const { user, userSecurity } = await usersCreator.createUserWithPassword(
      userAttributes,
      {
        structureId,
        role,
      }
    );
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.password).toBeDefined();
    expect(user.passwordLastUpdate).toBeDefined();
    expect(userSecurity).toBeDefined();
    expect(userSecurity.temporaryTokens).toBeNull();
    expect(user.role).toEqual(role);
    expect(user.verified).toBeFalsy();
    expect(user.structureId).toEqual(structureId);
    expect(userSecurity.userId).toEqual(user.id);
    expect(
      await passwordGenerator.checkPassword({ password, hash: user.password })
    ).toBeTruthy();

    // clean
    await usersDeletor.deleteUser({
      userId: user.id,
      structureId,
    });
  });

  it("createUserWithTmpToken", async () => {
    const structureId = 2;
    const role: UserRole = "facteur";
    const userAttributes: RegisterUserAdminDto = {
      email: "newUser2@test.com",
      nom: "Smith",
      prenom: "Tom",
      role,
      structureId,
    };
    const { user, userSecurity } = await usersCreator.createUserWithTmpToken(
      userAttributes
    );
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.password).toBeDefined();
    expect(user.passwordLastUpdate).toBeDefined();
    expect(userSecurity).toBeDefined();
    expect(user.role).toEqual(role);
    expect(user.verified).toBeTruthy(); // user is auto-verified here
    expect(user.structureId).toEqual(structureId);
    expect(userSecurity.userId).toEqual(user.id);
    expect(userSecurity.temporaryTokens).toBeDefined();
    expect(userSecurity.temporaryTokens.type).toEqual("create-user");
    expect(userSecurity.temporaryTokens.token).toBeDefined();
    expect(userSecurity.temporaryTokens.validity).toBeDefined();
    const useSecurityByToken = await userSecurityRepository.findOneByTokenAttribute(
      userSecurity.temporaryTokens.token
    );
    expect(useSecurityByToken).toBeDefined();
    expect(useSecurityByToken.uuid).toEqual(userSecurity.uuid);

    // clean
    await usersDeletor.deleteUser({
      userId: user.id,
      structureId,
    });
  });
});
