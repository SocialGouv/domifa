import { Connection } from "typeorm";
import { AppTestHelper } from "../../../util/test";
import { TESTS_USERS_USAGER } from "../../../_tests";
import { userUsagerRepository } from "./userUsagerRepository.service";

describe("userUsagerRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("findMany returns all users", async () => {
    const users = await userUsagerRepository.findMany({});
    expect(users).toBeDefined();

    expect(users.length).toEqual(TESTS_USERS_USAGER.ALL.length);
  });
});
