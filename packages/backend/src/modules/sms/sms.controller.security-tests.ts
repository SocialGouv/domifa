import { HttpStatus } from "@nestjs/common";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../_tests";
import { AppTestContext, AppTestHttpClient } from "../../util/test";
import { ALL_USER_STRUCTURE_ROLES, PageOptions } from "@domifa/common";

////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

const CONTROLLER = "SmsController";

export const SmsControllerSecurityTests: AppTestHttpClientSecurityTestDef[] = [
  {
    label: `${CONTROLLER}.getUsagerSms`,
    query: async (context: AppTestContext) => {
      return {
        response: await AppTestHttpClient.post(`/sms/usager/4444444`, {
          context,
          body: new PageOptions(),
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ALL_USER_STRUCTURE_ROLES,
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            invalidStructureIdExpectedResponseStatus: HttpStatus.BAD_REQUEST,
          }
        ),
      };
    },
  },
];
