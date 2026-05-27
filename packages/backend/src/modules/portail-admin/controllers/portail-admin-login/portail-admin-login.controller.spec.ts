import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import { AuthModule } from "../../../../auth/auth.module";
import { TESTS_USERS_ADMIN } from "../../../../_tests";
import { clearTestOtpCodes, peekTestOtpCode } from "../../../otp/otp-test-sink";
import { AppTestContext, AppTestHelper } from "../../../../util/test";
import { PortailAdminModule } from "../../portail-admin.module";
import { PortailAdminLoginController } from "./portail-admin-login.controller";
import { appLogSecurityRepository, otpRepository } from "../../../../database";

const ADMIN =
  TESTS_USERS_ADMIN.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];
const LOGIN_PATH = "/portail-admins/auth/login";

describe("Admins Login Controller", () => {
  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [],
        imports: [PortailAdminModule, AuthModule],
        providers: [],
      },
      { initApp: true }
    );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  beforeEach(async () => {
    // Codes from previous tests would otherwise leak via the test sink and
    // make the OTP_REQUIRED → claim flow non-deterministic. We also wipe
    // OTP rows for this admin in DB: an active row would be silently reused
    // by OtpService.doGenerateOrResend, bypassing recordTestOtpCode and
    // leaving the sink empty for the next priming call. Audit rows are
    // wiped too, otherwise an accumulated FAILED_AUTH stack would trip the
    // lockout / OTP per-user rate-limit and prevent the mint.
    clearTestOtpCodes();
    await otpRepository.delete({ userUuid: ADMIN.uuid });
    await appLogSecurityRepository.delete({ userSupervisorId: ADMIN.id });
  });

  it("should be defined", async () => {
    const controller = context.module.get<PortailAdminLoginController>(
      PortailAdminLoginController
    );
    expect(controller).toBeDefined();
  });

  it("returns 400 when the password format is invalid (DTO validation runs first)", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post(LOGIN_PATH)
      .send({
        email: ADMIN.email,
        password: "INVALID_PASS",
      });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it("returns LOGIN_FAILED on wrong password and does NOT generate an OTP", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post(LOGIN_PATH)
      .send({
        email: ADMIN.email,
        password: "Azerty012345678",
      });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({ message: "LOGIN_FAILED" });
    // Anti-enumeration: bad creds must not mint an OTP for the targeted user.
    expect(peekTestOtpCode(ADMIN.uuid)).toBeNull();
  });

  it("first call with valid creds and no otp-code returns OTP_REQUIRED", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post(LOGIN_PATH)
      .send({
        email: ADMIN.email,
        password: ADMIN.password,
      });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({ code: "OTP_REQUIRED" });
    expect(peekTestOtpCode(ADMIN.uuid)).toMatch(/^\d{6}$/);
  });

  it("second call with the captured code returns a token", async () => {
    // Prime the OTP by calling without code first.
    const first = await supertest(context.app.getHttpServer())
      .post(LOGIN_PATH)
      .send({
        email: ADMIN.email,
        password: ADMIN.password,
      });
    expect(first.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(first.body).toEqual({ code: "OTP_REQUIRED" });

    const otpCode = peekTestOtpCode(ADMIN.uuid);
    expect(otpCode).toMatch(/^\d{6}$/);

    const second = await supertest(context.app.getHttpServer())
      .post(LOGIN_PATH)
      .set("otp-code", otpCode!)
      .send({
        email: ADMIN.email,
        password: ADMIN.password,
      });
    expect(second.status).toBe(HttpStatus.OK);
    expect(second.body.token).toBeDefined();
  });

  it("returns OTP_INVALID when the code does not match the active OTP", async () => {
    // Prime an active OTP for this scope.
    await supertest(context.app.getHttpServer()).post(LOGIN_PATH).send({
      email: ADMIN.email,
      password: ADMIN.password,
    });

    const response = await supertest(context.app.getHttpServer())
      .post(LOGIN_PATH)
      .set("otp-code", "000000")
      .send({
        email: ADMIN.email,
        password: ADMIN.password,
      });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({ code: "OTP_INVALID" });
  });
});
