////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../_tests";

const CONTROLLER = "UsagerDocsController";

export const UsagerDocsControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getDocument`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get(
          "/docs/1/c669f08b-74a8-4ffc-8128-c9e29e2fd535",
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST, // filesystem document does not exists in tests
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.getUsagerDocuments`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/docs/1", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.OK, // filesystem document does not exists in tests
          }
        ),
      }),
    },
  ];
