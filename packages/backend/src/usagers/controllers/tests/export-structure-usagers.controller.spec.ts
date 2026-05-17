import { HttpStatus } from "@nestjs/common";

import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { peekTestOtpCode } from "../../../modules/otp/otp-test-sink";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import { UsagersModule } from "../../usagers.module";
import { ExportStructureUsagersController } from "../export-structure-usagers.controller";

// `/export/:statut` is OtpGuard-protected (@RequireOtp("EXPORT")). Two-pass
// flow per endpoint:
//   1. First call → no `otp-code` header → guard mints+stores an OTP and
//      replies 401 OTP_REQUIRED. The plaintext code is captured by
//      otp-test-sink (envId="test"-only side channel from OtpService).
//   2. Second call → `otp-code` header from the sink → guard claims the
//      OTP row and the request flows through.
describe("ExportStructureUsagersController", () => {
  let controller: ExportStructureUsagersController;
  let context: AppTestContext;

  beforeAll(async () => {
    // UsagersModule already declares ExportStructureUsagersController and
    // imports OtpModule; re-declaring the controller in the test root
    // breaks DI for `@UseGuards(OtpGuard)` (OtpService not exported by
    // UsagersModule), so we just import the module as-is.
    context = await AppTestHelper.bootstrapTestApp(
      {
        imports: [UsagersModule],
      },
      { initApp: true }
    );
    controller = context.module.get<ExportStructureUsagersController>(
      ExportStructureUsagersController
    );

    const authInfo =
      TESTS_USERS_STRUCTURE.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
    await AppTestHelper.authenticateStructure(authInfo, { context });
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("GET /export/:statut", () => {
    it("rejects with OTP_REQUIRED when no code is provided", async () => {
      const response = await AppTestHttpClient.get("/export/TOUS", {
        context,
      });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body).toEqual({ code: "OTP_REQUIRED" });
    });

    it("returns the xlsx export when the OTP code is replayed", async () => {
      const otpCode = peekTestOtpCode(context.user!.userUUID!);
      expect(otpCode).toMatch(/^\d{6}$/);

      const response = await AppTestHttpClient.get("/export/TOUS", {
        context,
        otpCode,
      });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.headers["content-type"]).toContain(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(response.headers["content-disposition"]).toContain(
        "Export DomiFa"
      );
    });
  });
});
