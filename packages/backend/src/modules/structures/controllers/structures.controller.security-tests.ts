import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import { ALL_USER_STRUCTURE_ROLES } from "@domifa/common";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

const CONTROLLER = "StructuresController";

export const StructuresControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getMyStructure`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/structures/ma-structure", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ALL_USER_STRUCTURE_ROLES,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.hardResetConfirm`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get(
          "/structures/hard-reset-confirm/INVALID-TOKEN",
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["admin"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
          }
        ),
      }),
    },
  ];
