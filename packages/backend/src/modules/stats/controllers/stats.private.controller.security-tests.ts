////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { HttpStatus } from "@nestjs/common";
import {
  AppTestHttpClientSecurityTestDef,
  securityTestDataBuilder,
  expectedResponseStatusBuilder,
} from "../../../_tests";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";

const CONTROLLER = "StatsPrivateController";

export const StatsPrivateControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getByDate`,
      query: async (context: AppTestContext) => {
        const structureId = securityTestDataBuilder.getUserStructureId(context);
        return {
          response: await AppTestHttpClient.post("/stats", {
            context,
            body: {
              startDate: new Date("2021-03-31T14:32:22Z"),
              endDate: new Date("2021-04-31T14:32:22Z"),
              structureId,
            },
          }),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: ["simple", "responsable", "admin"],
              validExpectedResponseStatus: HttpStatus.CREATED,
            }
          ),
        };
      },
    },
    {
      label: `${CONTROLLER}.exportByDate`,
      query: async (context: AppTestContext) => {
        const structureId = securityTestDataBuilder.getUserStructureId(context);
        return {
          response: await AppTestHttpClient.post("/stats/export", {
            context,
            body: {
              startDate: new Date("2021-03-31T14:32:22Z"),
              endDate: new Date("2021-04-31T14:32:22Z"),
              structureId,
            },
          }),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: ["simple", "responsable", "admin"],
              validExpectedResponseStatus: HttpStatus.OK,
            }
          ),
        };
      },
    },
  ];
