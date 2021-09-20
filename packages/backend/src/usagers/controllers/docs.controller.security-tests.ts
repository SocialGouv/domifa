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

const CONTROLLER = "DocsController";

export const DocsControllerSecurityTests: AppTestHttpClientSecurityTestDef[] = [
  {
    label: `${CONTROLLER}.getDocument`,
    query: async (context: AppTestContext) => ({
      response: await AppTestHttpClient.get("/docs/1/0", {
        context,
      }),
      expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
        context.user,
        {
          roles: ["simple", "responsable", "admin"],
          validExpectedResponseStatus: HttpStatus.BAD_REQUEST, // filesystem document does not exists in tests
        }
      ),
    }),
  },
];
