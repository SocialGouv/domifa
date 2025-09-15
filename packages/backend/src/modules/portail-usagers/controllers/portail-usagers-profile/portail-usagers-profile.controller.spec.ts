import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import { AuthModule } from "../../../../auth/auth.module";
import { AppTestContext, AppTestHelper } from "../../../../util/test";
import { TESTS_USERS_USAGER } from "../../../../_tests";
import { PortailUsagersModule } from "../../portail-usagers.module";
import { PortailUsagersProfileController } from "./portail-usagers-profile.controller";

const PERMANENT_PASS_USER = TESTS_USERS_USAGER.ALL.find(
  (x) => x.login === "LNQIFFBK"
);

describe("PortailUsagersProfileController", () => {
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
    const controller = context.module.get<PortailUsagersProfileController>(
      PortailUsagersProfileController
    );
    expect(controller).toBeDefined();
  });
  describe("GET /portail-usagers/profile/me", () => {
    it("should return user profile for authenticated usager", async () => {
      const response = await supertest(context.app.getHttpServer())
        .get("/portail-usagers/profile/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      expect(response.body.usager).toBeDefined();
      expect(response.body.acceptTerms).toBeDefined();
    });

    it("should return 401 for unauthenticated request", async () => {
      await supertest(context.app.getHttpServer())
        .get("/portail-usagers/profile/me")
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("GET /portail-usagers/profile/documents", () => {
    it("should return documents for authenticated usager", async () => {
      const response = await supertest(context.app.getHttpServer())
        .get("/portail-usagers/profile/documents")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 401 for unauthenticated request", async () => {
      await supertest(context.app.getHttpServer())
        .get("/portail-usagers/profile/documents")
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("GET /portail-usagers/profile/pending-interactions", () => {
    it("should return pending interactions for authenticated usager", async () => {
      const response = await supertest(context.app.getHttpServer())
        .get("/portail-usagers/profile/pending-interactions")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
    });

    it("should return 401 for unauthenticated request", async () => {
      await supertest(context.app.getHttpServer())
        .get("/portail-usagers/profile/pending-interactions")
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("POST /portail-usagers/profile/interactions", () => {
    it("should return interactions for authenticated usager with valid pagination", async () => {
      const response = await supertest(context.app.getHttpServer())
        .post("/portail-usagers/profile/interactions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          page: 1,
          take: 10,
        })
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
    });

    it("should return 401 for unauthenticated request", async () => {
      await supertest(context.app.getHttpServer())
        .post("/portail-usagers/profile/interactions")
        .send({
          page: 1,
          take: 10,
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
