import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import { AuthModule } from "../../auth/auth.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { PortailAdminModule } from "../portail-admin.module";
import { PortailAdminLoginController } from "./portail-admin-login.controller";

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

  it("should be defined", async () => {
    const controller = context.module.get<PortailAdminLoginController>(
      PortailAdminLoginController
    );
    expect(controller).toBeDefined();
  });

  it("should accept login for valid admin login/password", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/portail-admins/auth/login")
      .send({
        email: "s1-admin@yopmail.com",
        password: "Azerty012345!",
      });
    expect(response.status).toBe(HttpStatus.OK);
  });

  it("should return bad request because password pattern is not valid", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/portail-admins/auth/login")
      .send({
        email: "s1-admin@yopmail.com",
        password: "INVALID_PASS",
      });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it("should deny login for valid admin login/password", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/portail-admins/auth/login")
      .send({
        email: "s1-admin@yopmail.com",
        password: "Azerty012345678",
      });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
