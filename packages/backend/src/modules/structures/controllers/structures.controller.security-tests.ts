import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import { ALL_USER_STRUCTURE_ROLES } from "@domifa/common";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

const CONTROLLER = "StructuresController";

export const StructuresControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getMyStructure`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/structures/ma-structure", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ALL_USER_STRUCTURE_ROLES,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.hardResetConfirm (no OTP code)`,
      query: async (context: AppTestContext) => ({
        // Endpoint is OtpGuard-protected: an authenticated admin with no
        // `otp-code` header is rejected with 401 + `{ code: "OTP_REQUIRED" }`,
        // which is what we expect on the "valid role" path here. Anonymous
        // and non-admin still get 401/403 from the upstream JWT/role guards.
        response: await AppTestHttpClient.post(
          "/structures/hard-reset-confirm",
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["admin"],
            validExpectedResponseStatus: HttpStatus.UNAUTHORIZED,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.hardResetConfirm (invalid OTP code)`,
      query: async (context: AppTestContext) => ({
        // Admin with a syntactically valid but unknown OTP code: guard hits
        // the claim path, finds no matching row, returns 401 + OTP_INVALID.
        // Belt-and-suspenders coverage for the case where someone might
        // accidentally make the guard skip validation when a code IS present.
        response: await AppTestHttpClient.post(
          "/structures/hard-reset-confirm",
          {
            context,
            otpCode: "999999",
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["admin"],
            validExpectedResponseStatus: HttpStatus.UNAUTHORIZED,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.hardResetConfirm (malformed OTP code)`,
      query: async (context: AppTestContext) => ({
        // Malformed header (not 6 digits) → guard's readOtpCode returns null
        // and the request takes the "no code provided" path → 401 OTP_REQUIRED.
        // Proves the strict regex on the header is enforced and that random
        // junk can't reach the claim path.
        response: await AppTestHttpClient.post(
          "/structures/hard-reset-confirm",
          {
            context,
            otpCode: "not-a-code",
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["admin"],
            validExpectedResponseStatus: HttpStatus.UNAUTHORIZED,
          }
        ),
      }),
    },
  ];
