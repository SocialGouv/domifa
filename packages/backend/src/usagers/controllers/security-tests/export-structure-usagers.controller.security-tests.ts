////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

const CONTROLLER = "ExportStructureUsagersController";

// Endpoint is OtpGuard-protected: an authenticated responsable/admin with no
// `x-otp-code` header is rejected with 401 + `{ code: "OTP_REQUIRED" }`,
// which is the "valid role" path here. Other roles still get 403 from the
// upstream role guard, anonymous still gets 401 from the JWT guard.
export const ExportStructureUsagersControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.export`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/export/TOUS", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.UNAUTHORIZED,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.export`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/export/VALIDE", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.UNAUTHORIZED,
          }
        ),
      }),
    },
  ];
