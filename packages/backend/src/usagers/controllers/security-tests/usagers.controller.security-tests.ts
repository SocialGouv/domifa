import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import { USER_STRUCTURE_ROLE_ALL } from "../../../_common/model";
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
      label: `${CONTROLLER}.findAllByStructure`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get(
          "/usagers?chargerTousRadies=false",
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: USER_STRUCTURE_ROLE_ALL,
          }
        ),
      }),
    },
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
  ];
