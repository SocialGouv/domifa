import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../../_tests";

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
          "/admin/structures-delete/send-mail/xxxs",
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
      label: `${CONTROLLER}.deleteSendInitialMail`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.put(
          "/admin/structures-delete/send-mail/59c846d8-0592-4790-a5e2-1daae9b8776e",
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
          "/admin/structures-delete/check-token/xssxsxs/INVALID-TOKEN",
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
              uuid: "xxs",
              token: "INVALID-TOKEN",
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
