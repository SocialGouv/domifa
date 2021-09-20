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

const CONTROLLER = "StatsPublicController";

export const StatsPublicControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.home`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/stats/home-stats", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowAnonymous(),
      }),
    },
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
