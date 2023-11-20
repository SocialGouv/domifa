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
    expect(users).toBeGreaterThan(2);
  });
});
