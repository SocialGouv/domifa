import { AppTestContext, AppTestHttpClient } from "../../util/test";

import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../_tests";
import { ALL_USER_STRUCTURE_ROLES } from "@domifa/common";

////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

const CONTROLLER = "InteractionsController";

export const InteractionsControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getInteractions`,
      query: async (context: AppTestContext) => {
        return {
          response: await AppTestHttpClient.post(`/interactions/4444444`, {
            context,
            body: {
              order: "desc",
              page: 0,
              take: 10,
            },
          }),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: ALL_USER_STRUCTURE_ROLES,
              validExpectedResponseStatus: 400, // car on utilise un faux id
            }
          ),
        };
      },
    },
  ];
