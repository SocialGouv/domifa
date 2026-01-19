import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import { AuthModule } from "../../../../auth/auth.module";
import { AppTestContext, AppTestHelper } from "../../../../util/test";
import { TESTS_USERS_USAGER } from "../../../../_tests";
import { PortailUsagersModule } from "../../portail-usagers.module";
import { PortailUsagersLoginController } from "./portail-usagers-login.controller";
import { userUsagerRepository } from "../../../../database";

// We keep the login/password fixtures in code, but the actual DB dump can
// change over time (passwordType flags may drift). We pick the correct fixture
// at runtime by reading userUsager.passwordType from the database.
const FIXTURES_BY_LOGIN = TESTS_USERS_USAGER.ALL.reduce((acc, u) => {
  acc[u.login] = u;
  return acc;
}, {} as Record<string, (typeof TESTS_USERS_USAGER.ALL)[number]>);

describe("Usagers Login Controller", () => {
  let context: AppTestContext;
  let PERMANENT_PASS_USER: (typeof TESTS_USERS_USAGER.ALL)[number];
  let TEMPORARY_PASS_USER: (typeof TESTS_USERS_USAGER.ALL)[number];

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [],
        imports: [PortailUsagersModule, AuthModule],
        providers: [],
      },
      { initApp: true }
    );

    const candidates = Object.values(FIXTURES_BY_LOGIN);
    const dbUsers = await Promise.all(
      candidates.map(async (fixture) => {
        const dbUser = await userUsagerRepository.findOne({
          where: { login: fixture.login },
          select: {
            id: true,
            login: true,
            passwordType: true,
          },
        });
        return { fixture, dbUser };
      })
    );

    const permanent = dbUsers.find(
      (x) => x.dbUser?.passwordType === "PERSONAL"
    );
    const temporary = dbUsers.find(
      (x) => x.dbUser?.passwordType !== "PERSONAL"
    );

    if (!permanent || !temporary) {
      throw new Error(
        "Cannot find both PERSONAL and non-PERSONAL userUsager in test fixtures; the DB dump and fixtures are out of sync."
      );
    }

    PERMANENT_PASS_USER = permanent.fixture;
    TEMPORARY_PASS_USER = temporary.fixture;
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
