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

const CONTROLLER = "DashboardController";

export const DashboardControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.export`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/dashboard/export", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
          context.user
        ),
      }),
    },
    {
      label: `${CONTROLLER}.dashboardStats`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/dashboard", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
          context.user
        ),
      }),
    },
  ];
