import { AppTestContext, AppTestHttpClient } from "../util/test";

import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../_tests";
import { ALL_USER_STRUCTURE_ROLES } from "@domifa/common";

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
              roles: ALL_USER_STRUCTURE_ROLES,
            }
          ),
        };
      },
    },
  ];
