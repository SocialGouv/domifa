import { userSecurityResetPasswordInitiator } from "../../../modules/users/services";
import { AppTestHelper } from "../../../util/test";
import { userStructureSecurityRepository } from "./userStructureSecurityRepository.service";

describe("userStructureSecurityRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("findOneByTokenAttribute returns matching user", async () => {
    const { user, userSecurity } =
      await userSecurityResetPasswordInitiator.generateResetPasswordToken({
        email: "s3-admin@yopmail.com",
        userProfile: "structure",
      });

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
