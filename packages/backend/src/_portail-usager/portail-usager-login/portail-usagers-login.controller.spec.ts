import { HttpStatus } from "@nestjs/common";
import * as request from "supertest";
import { AuthModule } from "../../auth/auth.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { PortailUsagerModule } from "../portail-usager.module";
import { PortailUsagersLoginController } from "./portail-usagers-login.controller";

describe("Usagers Login Controller", () => {
  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [],
        imports: [PortailUsagerModule, AuthModule],
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
    const response = await request(context.app.getHttpServer())
      .post("/portail-usagers/auth/login")
      .send({
        login: "WKYJBDXS",
        password: "63635285",
      });
    expect(response.status).toBe(HttpStatus.OK);
  });

  it("should deny login for valid usager login/password", async () => {
    const response = await request(context.app.getHttpServer())
      .post("/portail-usagers/auth/login")
      .send({
        login: "WKYJBDXS",
        password: "INVALID-PASS",
      });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
