import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";
import CREATE_USAGER_DTO from "../../services/tests/CREATE_USAGER_DTO.const";

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
      label: `${CONTROLLER}.createUsager`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.post("/usagers", {
          context,
          body: {
            ...CREATE_USAGER_DTO,
            referrerId: 10000, // Fake referrerId
          },
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            invalidStructureIdExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            roles: ["simple", "responsable", "admin"],
          }
        ),
      }),
    },
  ];
