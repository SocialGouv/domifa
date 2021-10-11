import { AppTestContext, AppTestHttpClient } from "../util/test";
import { USER_STRUCTURE_ROLE_ALL } from "../_common/model";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../_tests";

////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

const CONTROLLER = "StructuresAuthController";

export const StructuresAuthControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.me`,
      query: async (context: AppTestContext) => {
        return {
          response: await AppTestHttpClient.get(`/structures/auth/me`, {
            context,
          }),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: USER_STRUCTURE_ROLE_ALL,
            }
          ),
        };
      },
    },
  ];
