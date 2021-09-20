import { AppTestContext, AppTestHttpClient } from "../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../_tests";

////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

const CONTROLLER = "UsagersStructureDocsController";

export const UsagersStructureDocsControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getDocument`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/usagers-structure-docs/1/xxx", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
          }
        ),
      }),
    },
  ];
