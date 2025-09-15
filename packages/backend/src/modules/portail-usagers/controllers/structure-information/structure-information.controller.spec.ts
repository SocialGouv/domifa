import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import { AuthModule } from "../../../../auth/auth.module";
import { AppTestContext, AppTestHelper } from "../../../../util/test";
import { TESTS_USERS_USAGER } from "../../../../_tests";
import { PortailUsagersModule } from "../../portail-usagers.module";
import { StructureInformationController } from "./structure-information.controller";

const PERMANENT_PASS_USER = TESTS_USERS_USAGER.ALL.find(
  (x) => x.login === "LNQIFFBK"
);

describe("StructureInformationController", () => {
  let context: AppTestContext;
  let authToken: string;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [],
        imports: [PortailUsagersModule, AuthModule],
        providers: [],
      },
      { initApp: true }
    );

    // Login to get auth token for authenticated requests
    const loginResponse = await supertest(context.app.getHttpServer())
      .post("/portail-usagers/auth/login")
      .send({
        login: PERMANENT_PASS_USER.login,
        password: PERMANENT_PASS_USER.password,
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    const controller = context.module.get<StructureInformationController>(
      StructureInformationController
    );
    expect(controller).toBeDefined();
  });

  describe("GET /portail-usagers/profile/structure-information", () => {
    it("should return structure information for authenticated usager", async () => {
      const response = await supertest(context.app.getHttpServer())
        .get("/portail-usagers/profile/structure-information")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 401 for unauthenticated request", async () => {
      await supertest(context.app.getHttpServer())
        .get("/portail-usagers/profile/structure-information")
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("should return 401 for invalid token", async () => {
      await supertest(context.app.getHttpServer())
        .get("/portail-usagers/profile/structure-information")
        .set("Authorization", "Bearer invalid-token")
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
