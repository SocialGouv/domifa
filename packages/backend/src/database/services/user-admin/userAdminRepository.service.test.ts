import { AppTestContext } from "./../../../util/test/AppTestContext.type";

import { AppTestHelper } from "../../../util/test";
import { TESTS_USERS_ADMIN } from "../../../_tests";
import { SECURITY_TESTS_NEST_MODULE } from "../../../_tests/SECURITY_TESTS_NEST_MODULE.const";
import {
  UserAdminRepository,
  USER_ADMIN_WHERE,
} from "./UserAdminRepository.service";

describe("userAdminRepository", () => {
  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(SECURITY_TESTS_NEST_MODULE);
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("count users", async () => {
    const count = await UserAdminRepository.countBy(USER_ADMIN_WHERE);

    // be sure the count is ok
    expect(count).toEqual(TESTS_USERS_ADMIN.ALL?.length);
  });

  it("findMany returns users count", async () => {
    const results = await UserAdminRepository.findBy(USER_ADMIN_WHERE);
    // be sure the count is ok
    expect(results.length).toEqual(TESTS_USERS_ADMIN.ALL?.length);
  });
});
