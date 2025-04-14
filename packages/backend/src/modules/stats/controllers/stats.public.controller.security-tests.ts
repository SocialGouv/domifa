////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";

const CONTROLLER = "StatsPublicController";

export const StatsPublicControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getPublicStats`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/stats/public-stats/52", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowAnonymous(),
      }),
    },
  ];
