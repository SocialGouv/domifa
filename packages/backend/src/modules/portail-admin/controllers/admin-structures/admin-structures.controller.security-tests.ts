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

const CONTROLLER = "AdminStructuresController";

export const AdminStructuresControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.confirmStructureCreation`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.post(
          "/admin/structures/confirm-structure-creation",
          {
            context,
            body: {
              structureId: 6,
              token: "xxxxxx",
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
    {
      label: `${CONTROLLER}.export`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/admin/structures/export", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
          context.user
        ),
      }),
    },
    {
      label: `${CONTROLLER}.list`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/admin/structures", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
          context.user
        ),
      }),
    },

    {
      label: `${CONTROLLER}.registerNewAdmin`,
      query: async (context: AppTestContext) => {
        return {
          response: await AppTestHttpClient.post(
            `/admin/structures/register-new-admin`,
            {
              context,
              body: {
                nom: "XXX",
              },
            }
          ),
          expectedStatus:
            expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
              context.user,
              {
                validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
              }
            ),
        };
      },
    },
  ];
