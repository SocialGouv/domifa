import { AppTestHelper } from "../../../util/test";
import { TESTS_USERS_USAGER } from "../../../_tests";
import { userUsagerRepository } from "./userUsagerRepository.service";

describe("userUsagerRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("findMany returns all users", async () => {
    const users = await userUsagerRepository.findBy({});
    expect(users).toBeDefined();

    expect(users.length).toEqual(TESTS_USERS_USAGER.ALL.length);
  });
});
