import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import { SECURITY_TESTS_NEST_MODULE } from "../../../_tests/SECURITY_TESTS_NEST_MODULE.const";
import { TESTS_USERS_ADMIN, TestUserAdmin } from "../../../_tests";
import { userSupervisorRepository } from "../../../database";
import { passwordGenerator } from "../../../util";

describe("Users Supervisor Controller", () => {
  let context: AppTestContext;
  let authInfo: TestUserAdmin;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(SECURITY_TESTS_NEST_MODULE, {
      initApp: true,
    });

    authInfo =
      TESTS_USERS_ADMIN.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
    await AppTestHelper.authenticateSupervisor(authInfo, { context });
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  describe("> Edit my password", () => {
    // This is the only supervisor fixture in the whole test suite, so
    // restore its password afterwards regardless of outcome.
    const NEW_PASSWORD = "NouveauPass123!";

    it("should allow a supervisor to edit their own password", async () => {
      try {
        const response = await AppTestHttpClient.post(
          "/users-supervisor/edit-my-password",
          {
            context,
            body: {
              oldPassword: authInfo.password,
              password: NEW_PASSWORD,
              passwordConfirmation: NEW_PASSWORD,
            },
          }
        );
        expect(response.status).toBe(200);
      } finally {
        const hash = await passwordGenerator.generatePasswordHash({
          password: authInfo.password,
        });
        await userSupervisorRepository.update(
          { id: authInfo.id },
          { password: hash }
        );
      }
    });
  });
});
