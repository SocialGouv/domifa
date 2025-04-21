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

const CONTROLLER = "AdminUsersController";

export const AdminStructuresControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.registerUserStructureAdmin`,
      query: async (context: AppTestContext) => {
        return {
          response: await AppTestHttpClient.post(
            `/admin/users/register-user-structure`,
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
    {
      label: `${CONTROLLER}.registerUserStructureAdmin`,
      query: async (context: AppTestContext) => {
        return {
          response: await AppTestHttpClient.post(
            `/admin/users/register-user-supervisor`,
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
    {
      label: `${CONTROLLER}.getUsersSupervisors`,
      query: async (context: AppTestContext) => {
        return {
          response: await AppTestHttpClient.get("/admin/users/", {
            context,
          }),
          expectedStatus:
            expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
              context.user,
              {
                validExpectedResponseStatus: HttpStatus.OK,
              }
            ),
        };
      },
    },
  ];
