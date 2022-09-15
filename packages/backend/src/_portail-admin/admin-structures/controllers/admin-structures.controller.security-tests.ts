import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
  securityTestDataBuilder,
} from "../../../_tests";

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
        response: await AppTestHttpClient.post("/admin/structures/confim", {
          context,
          body: {
            structureId: 6,
            token: "xxxxxx",
          },
        }),
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
      label: `${CONTROLLER}.stats`,
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
      label: `${CONTROLLER}.smsEnableByDomifa`,
      query: async (context: AppTestContext) => {
        const structureId = securityTestDataBuilder.getUserStructureId(context);
        return {
          response: await AppTestHttpClient.put(
            `/admin/structures/sms/enable/${structureId}`,
            {
              context,
            }
          ),
          expectedStatus:
            expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
              context.user
            ),
        };
      },
    },
  ];
