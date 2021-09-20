////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { AppTestContext, AppTestHttpClient } from "../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../_tests";

const CONTROLLER = "AgendaController";

export const AgendaControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getAll`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/agenda", {
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
    {
      label: `${CONTROLLER}.getUsersMeeting`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/agenda/users", {
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
