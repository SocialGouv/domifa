import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../util/test";
import { USER_STRUCTURE_ROLE_ALL } from "../../_common/model";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../_tests";

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
        response: await AppTestHttpClient.get("/usagers", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: USER_STRUCTURE_ROLE_ALL,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.isDoublon`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/usagers/doublon/nom/prenom/4", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.editPreference`,
      query: async (context: AppTestContext) => ({
        // on utilise un mauvais ID pour ne pas modifier les données (on cherche juste à tester l'accès au controlleur)
        response: await AppTestHttpClient.post("/usagers/preference/4444444", {
          context,
          body: {
            phone: false,
            phoneNumber: "00-00-00-00-00",
            email: false,
          },
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST, // car mauvais id
          }
        ),
      }),
    },
  ];
