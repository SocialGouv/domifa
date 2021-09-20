import { HttpStatus } from "@nestjs/common";
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

const CONTROLLER = "StatsPrivateController";

export const StatsPrivateControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.exportByDate`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.post("/stats/export", {
          context,
          body: {
            start: new Date("2021-03-31T14:32:22Z"),
            end: new Date("2021-04-31T14:32:22Z"),
            structureId: context.user?.structureId ?? 1, // user structureId (default to "1" if anonymous)
          },
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.CREATED,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.getByDate`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.post("/stats/export", {
          context,
          body: {
            start: new Date("2021-03-31T14:32:22Z"),
            end: new Date("2021-04-31T14:32:22Z"),
            structureId: context.user?.structureId ?? 1, // user structureId (default to "1" if anonymous)
          },
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.CREATED,
          }
        ),
      }),
    },
  ];
