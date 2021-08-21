import { Connection } from "typeorm";
import { AppTestHelper } from "../../../../util/test";
import { userSecurityRepository } from "./userSecurityRepository.service";
import { userSecurityResetPasswordInitiator } from "./userSecurityResetPasswordInitiator.service";

describe("userSecurityRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("findOneByTokenAttribute returns matching user", async () => {
    const { user, userSecurity } =
      await userSecurityResetPasswordInitiator.generateResetPasswordToken({
        email: "roseline.parmentier@yopmail.com",
      });

    const userSecurity2 = await userSecurityRepository.findOneByTokenAttribute(
      userSecurity.temporaryTokens.token
    );
    expect(userSecurity2).toBeDefined();
    // be sure the user id is ok
    expect(userSecurity2.userId).toEqual(user.id);
    expect(userSecurity2.userId).toEqual(5);
  });
});
