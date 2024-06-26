import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import { AuthModule } from "../../../../auth/auth.module";
import { AppTestContext, AppTestHelper } from "../../../../util/test";
import { TESTS_USERS_USAGER } from "../../../../_tests";
import { PortailUsagersModule } from "../../portail-usagers.module";
import { PortailUsagersLoginController } from "./portail-usagers-login.controller";

const TEMPORARY_PASS_USER = TESTS_USERS_USAGER.ALL.find(
  (x) => x.login === "WKYJBDXS"
);
const PERMANENT_PASS_USER = TESTS_USERS_USAGER.ALL.find(
  (x) => x.login === "LNQIFFBK"
);

describe("Usagers Login Controller", () => {
  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [],
        imports: [PortailUsagersModule, AuthModule],
        providers: [],
      },
      { initApp: true }
    );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    const controller = context.module.get<PortailUsagersLoginController>(
      PortailUsagersLoginController
    );
    expect(controller).toBeDefined();
  });

  it("should accept login for valid usager login/password", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/portail-usagers/auth/login")
      .send({
        login: PERMANENT_PASS_USER.login,
        password: PERMANENT_PASS_USER.password,
      });
    expect(response.status).toBe(HttpStatus.OK);
  });

  it("should deny login if change password required", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/portail-usagers/auth/login")
      .send({
        login: TEMPORARY_PASS_USER.login,
        password: TEMPORARY_PASS_USER.password,
      });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.text).toBe(`{"message":"CHANGE_PASSWORD_REQUIRED"}`);
  });

  it("should not accept login for valid usager login/password with a password which not respect rules", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/portail-usagers/auth/login")
      .send({
        login: TEMPORARY_PASS_USER.login,
        password: TEMPORARY_PASS_USER.password,
        newPassword: "password007",
      });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it("should accept login for valid usager login/password with temporary password and new password", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/portail-usagers/auth/login")
      .send({
        login: TEMPORARY_PASS_USER.login,
        password: TEMPORARY_PASS_USER.password,
        newPassword: TEMPORARY_PASS_USER.password, // ici on garde le même mot de passe pour ne pas casser les tests
      });
    expect(response.status).toBe(HttpStatus.OK);
  });

  it("should deny login for invalid usager login/password", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/portail-usagers/auth/login")
      .send({
        login: TEMPORARY_PASS_USER.login,
        password: TEMPORARY_PASS_USER.password + "INVALID-PASS",
      });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.text).toBe(`{"message":"USAGER_LOGIN_FAIL"}`);
  });
});
