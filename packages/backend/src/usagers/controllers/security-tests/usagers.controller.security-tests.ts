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

const CONTROLLER = "UsagersController";

export const UsagersControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.checkDuplicates`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.post(
          "/usagers/check-duplicates-name",
          {
            context,
            body: {
              nom: "nom",
              prenom: "prenom",
            },
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            validExpectedResponseStatus: HttpStatus.CREATED,
            roles: ["simple", "responsable", "admin"],
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.assignReferrersToAnotherUser`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.post(
          "/usagers/check-duplicates-name",
          {
            context,
            body: {
              newReferrerId: 1,
              usagersRefs: [1, 2],
            },
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            validExpectedResponseStatus: HttpStatus.CREATED,
            roles: ["simple", "responsable", "admin"],
            validStructureIds: [1],
          }
        ),
      }),
    },
  ];
