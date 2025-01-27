import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import { USER_STRUCTURE_ROLE_ALL } from "../../../_common/model";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

const CONTROLLER = "SearchUsagersController";

export const UsagersControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.findAllByStructure`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get(
          "/usagers?chargerTousRadies=false",
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: USER_STRUCTURE_ROLE_ALL,
          }
        ),
      }),
    },
  ];
