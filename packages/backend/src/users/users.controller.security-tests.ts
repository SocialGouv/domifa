////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { AppTestContext, AppTestHttpClient } from "../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../_tests";

const CONTROLLER = "UserController";

export const UserControllerSecurityTests: AppTestHttpClientSecurityTestDef[] = [
  {
    label: `${CONTROLLER}.getUsers`,
    query: async (context: AppTestContext) => ({
      response: await AppTestHttpClient.get("/users", {
        context,
      }),
      expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
        context.user,
        {
          roles: ["responsable", "admin"],
        }
      ),
    }),
  },
];
