import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../util/test";
import { USER_STRUCTURE_ROLE_ALL } from "../../_common/model";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../_tests";

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
            roles: USER_STRUCTURE_ROLE_ALL,
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
            validExpectedResponseStatus: HttpStatus.INTERNAL_SERVER_ERROR,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.deleteOne`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.delete(
          "/structures/confirm/4444/INVALID-TOKEN/INVALID_NAME",
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
          context.user,
          {
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.checkDelete`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.delete(
          "/structures/check/1/INVALID-TOKEN",
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
          context.user,
          {
            validExpectedResponseStatus: HttpStatus.INTERNAL_SERVER_ERROR,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.sendMailConfirmDeleteStructure`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.delete("/structures/4444444", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
          context.user,
          {
            validExpectedResponseStatus: HttpStatus.INTERNAL_SERVER_ERROR,
          }
        ),
      }),
    },
  ];
