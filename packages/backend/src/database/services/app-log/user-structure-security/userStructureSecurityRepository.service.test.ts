import { AppTestHelper } from "../../../../util/test";
import { userStructureSecurityRepository } from "./userStructureSecurityRepository.service";

import { userStructureSecurityResetPasswordInitiator } from "./userStructureSecurityResetPasswordInitiator.service";

describe("userStructureSecurityRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("findOneByTokenAttribute returns matching user", async () => {
    const { user, userSecurity } =
      await userStructureSecurityResetPasswordInitiator.generateResetPasswordToken(
        {
          email: "s3-admin@yopmail.com",
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
