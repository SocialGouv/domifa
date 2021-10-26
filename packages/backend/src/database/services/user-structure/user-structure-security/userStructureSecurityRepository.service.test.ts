import { Connection } from "typeorm";
import { AppTestHelper } from "../../../../util/test";
import { userStructureSecurityRepository } from "./userStructureSecurityRepository.service";
import { userStructureSecurityResetPasswordInitiator } from "./userStructureSecurityResetPasswordInitiator.service";

describe("userStructureSecurityRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("findOneByTokenAttribute returns matching user", async () => {
    const { user, userSecurity } =
      await userStructureSecurityResetPasswordInitiator.generateResetPasswordToken(
        {
          email: "structure-admin@yopmail.com",
        }
      );

    const userSecurity2 =
      await userStructureSecurityRepository.findOneByTokenAttribute(
        userSecurity.temporaryTokens.token
      );
    expect(userSecurity2).toBeDefined();
    // be sure the user id is ok
    expect(userSecurity2.userId).toEqual(user.id);
    expect(userSecurity2.userId).toEqual(5);
  });
});
