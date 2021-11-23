import { Connection } from "typeorm";
import { AppTestHelper } from "../../../util/test";
import { TESTS_USERS_ADMIN } from "../../../_tests";
import { userAdminRepository } from "./userAdminRepository.service";

describe("userAdminRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("count users", async () => {
    const count = await userAdminRepository.count({
      where: {},
    });
    // be sure the count is ok
    expect(count).toEqual(TESTS_USERS_ADMIN.ALL?.length);
  });

  it("findMany returns users count", async () => {
    const results = await userAdminRepository.findMany({});
    // be sure the count is ok
    expect(results.length).toEqual(TESTS_USERS_ADMIN.ALL?.length);
  });
});
