import { AppTestContext, AppTestHttpClient } from "../util/test";
import { USER_STRUCTURE_ROLE_ALL } from "../_common/model";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../_tests";

////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

const CONTROLLER = "SmsController";

export const SmsControllerSecurityTests: AppTestHttpClientSecurityTestDef[] = [
  {
    label: `${CONTROLLER}.enableByDomifa`,
    query: async (context: AppTestContext) => {
      const structureId = context.user?.structureId ?? 1; // user structureId (default to "1" if anonymous)
      return {
        response: await AppTestHttpClient.put(`/sms/enable/${structureId}`, {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowSuperAdminDomifaOnly(
          context.user
        ),
      };
    },
  },
  {
    label: `${CONTROLLER}.getUsagerSms`,
    query: async (context: AppTestContext) => {
      return {
        response: await AppTestHttpClient.get(`/sms/usager/4444444`, {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: USER_STRUCTURE_ROLE_ALL,
            validExpectedResponseStatus: 400, // car on utilise un faux id
          }
        ),
      };
    },
  },
];
