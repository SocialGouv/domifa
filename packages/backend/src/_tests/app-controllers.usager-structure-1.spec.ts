import { AppTestContext, AppTestHelper } from "../util/test";
import { SECURITY_TESTS_NEST_MODULE } from "./SECURITY_TESTS_NEST_MODULE.const";
import { TESTS_USERS_USAGER } from "./_core";

// NOTE: pour n'exécuter que certains tests de sécurité, renseigner la variable d'environnement DOMIFA_FILTER_SEC_TEST, exemple:
//
// `DOMIFA_FILTER_SEC_TEST=Agenda ENV_FILE=tests-local npx jest -- app-controllers.structure-facteur.spec.ts`

const TEST_BASENAME = "Usager - structure 1";

describe(`App controllers security - ${TEST_BASENAME}`, () => {
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(SECURITY_TESTS_NEST_MODULE, {
      initApp: true,
    });

    const authInfo =
      TESTS_USERS_USAGER.BY_USAGER_UUID["97b7e840-0e93-4bf4-ba7d-0a406aa898f2"];
    await AppTestHelper.authenticateUsager(authInfo, { context });
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it(`context`, async () => {
    expect(context).toBeDefined();
  });

  // for (const testDef of AppTestHelper.filterSecurityTests(
  //   API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
  // )) {
  //   it(`[API SECURITY TEST][${TEST_BASENAME}] ${testDef.label}`, async () => {
  //     const { response, expectedStatus } = await testDef.query(context);

  //     expect(response.status).toBe(expectedStatus);
  //   });
  // }
});
