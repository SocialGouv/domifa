import { UserStructureRole } from "@domifa/common";
import { userStructureSecurityRepository } from "../../../../database";
import { passwordGenerator } from "../../../../util/encoding/passwordGenerator.service";
import { AppTestHelper } from "../../../../util/test";
import { RegisterUserAdminDto } from "../../dto/register-user-admin.dto";
import { UserDto } from "../../dto/user.dto";
import { userStructureCreator } from "../user-structure-creator.service";
import { usersDeletor } from "../users-deletor.service";

describe("userStructureCreator", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("createUserWithPassword", async () => {
    const structureId = 2;
    const role: UserStructureRole = "facteur";
    const password = "?p@sw$rd!";
    const userAttributes: UserDto = {
      email: "newUser1@test.com",
      nom: "Smith",
      prenom: "Tom",
      password,
      structureId,
    };
    const { user, userSecurity } =
      await userStructureCreator.createUserWithPassword(userAttributes, {
        structureId,
        role,
      });
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
    const role: UserStructureRole = "facteur";
    const userAttributes: RegisterUserAdminDto = {
      email: "newUser2@test.com",
      nom: "Smith",
      prenom: "Tom",
      role,
      structureId,
    };
    const { user, userSecurity } =
      await userStructureCreator.createUserWithTmpToken(userAttributes);
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
    const useSecurityByToken =
      await userStructureSecurityRepository.findOneByTokenAttribute(
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
