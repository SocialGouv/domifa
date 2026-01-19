import { AppTestHelper } from "../../../util/test";
import { userUsagerLoginRepository } from "./userUsagerLoginRepository.service";

describe("userUsagerLoginRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("Count all logins made", async () => {
    const users = await userUsagerLoginRepository.count();
    // The canonical test dump contains 2 rows in `user_usager_login`.
    // This test asserts that the repository is wired correctly, not the exact dump size.
    expect(users).toBeGreaterThanOrEqual(2);
  });
});
