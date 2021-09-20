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

const CONTROLLER = "UserPublicController";

export const UserPublicControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.validateEmail`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.post("/users/validate-email", {
          context,
          body: {
            email: "xxx",
          },
        }),
        expectedStatus: expectedResponseStatusBuilder.allowAnonymous(),
      }),
    },
  ];
