import { AppTestContext, AppTestHelper } from "../util/test";
import { API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS } from "./API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS.const";
import { SECURITY_TESTS_NEST_MODULE } from "./SECURITY_TESTS_NEST_MODULE.const";
import { TESTS_USERS_STRUCTURE } from "./_core";

// NOTE: pour n'exécuter que certains tests de sécurité, renseigner la variable d'environnement DOMIFA_FILTER_SEC_TEST, exemple:
//
// `DOMIFA_FILTER_SEC_TEST=Agenda ENV_FILE=tests-local npx jest -- app-controllers.structure-agent.spec.ts`

const TEST_BASENAME = "Structure agent";

describe(`App controllers security - ${TEST_BASENAME}`, () => {
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(SECURITY_TESTS_NEST_MODULE, {
      initApp: true,
    });

    const authInfo = TESTS_USERS_STRUCTURE.BY_EMAIL["s1-agent@yopmail.com"];
    await AppTestHelper.authenticateStructure(authInfo, { context });
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  for (const testDef of AppTestHelper.filterSecurityTests(
    API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
  )) {
    it(`[API SECURITY TEST][${TEST_BASENAME}] ${testDef.label}`, async () => {
      const { response, expectedStatus } = await testDef.query(context);

      expect(response.status).toBe(expectedStatus);
    });
  }
});
