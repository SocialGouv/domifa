////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

const CONTROLLER = "UsagersDecisionController";

export const UsagersDecisionControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.deleteLastDecision`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.delete("/usagers-decision/1", {
          context,
        }),

        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST, // filesystem document does not exists in tests
          }
        ),
      }),
    },
  ];
