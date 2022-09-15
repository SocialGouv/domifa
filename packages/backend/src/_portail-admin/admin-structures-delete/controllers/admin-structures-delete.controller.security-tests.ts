import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

const CONTROLLER = "AdminStructuresDeleteController";

export const AdminStructuresDeleteControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.deleteSendInitialMail`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.put(
          "/admin/structures-delete/send-mail/4444444",
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
      label: `${CONTROLLER}.deleteCheck`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.put(
          "/admin/structures-delete/check-token/1/INVALID-TOKEN",
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
      label: `${CONTROLLER}.deleteConfirm`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.delete(
          "/admin/structures-delete/confirm-delete-structure",
          {
            context,
            body: {
              id: 4444,
              token: "INVALID-TOKEN",
              nom: "INVALID_NAME",
            },
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
  ];
