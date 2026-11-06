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

const CONTROLLER = "StructureDocController";

export const StructureDocControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getStructureDocs`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/structure-docs", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin", "agent"],
          }
        ),
      }),
    },
    // Unknown uuid: allowed roles get past the role check and find nothing (400)
    {
      label: `${CONTROLLER}.deleteDocument`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.delete(
          "/structure-docs/3f1c0a52-6d2b-4e8a-9c1f-7b5e2d4a8c90",
          { context }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            roles: ["admin"],
          }
        ),
      }),
    },
  ];
