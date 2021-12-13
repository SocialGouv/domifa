import { HttpStatus } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { AppTestContext, AppTestHttpClient } from "../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../_tests";

////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

const CONTROLLER = "UsagersStructureDocsController";
const FAKE_UUID = uuidv4();
export const UsagersStructureDocsControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getStructureCustomDoc`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get(
          "/usagers-structure-docs/structure/1/" + FAKE_UUID,
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
          }
        ),
      }),
    },
    // {
    //   label: `${CONTROLLER}.getDomifaCustomDoc`,
    //   query: async (context: AppTestContext) => ({
    //     response: await AppTestHttpClient.post(
    //       "/usagers-structure-docs/domifa/7/attestation_postale",
    //       {
    //         context,
    //       }
    //     ),
    //     expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
    //       context.user,
    //       {
    //         roles: ["simple", "responsable", "admin"],
    //         validExpectedResponseStatus: HttpStatus.CREATED,
    //         validStructureIds: [1], // usager 1 only exists in structure 1, else UsagerAccessGuard returns BAD_REQUEST
    //         invalidStructureIdExpectedResponseStatus: HttpStatus.BAD_REQUEST,
    //       }
    //     ),
    //   }),
    // },
  ];
