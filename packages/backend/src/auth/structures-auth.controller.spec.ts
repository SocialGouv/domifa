import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";
import { AppTestContext, AppTestHelper } from "../util/test";
import { AuthModule } from "./auth.module";
import { StructuresAuthController } from "./structures-auth.controller";

describe("Structure Auth Controller", () => {
  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [],
        imports: [AuthModule],
        providers: [],
      },
      { initApp: true }
    );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    const controller = context.module.get<StructuresAuthController>(
      StructuresAuthController
    );
    expect(controller).toBeDefined();
  });

  it("should accept login for valid structure login/password", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/structures/auth/login")
      .send({
        email: "s3-instructeur@yopmail.com",
        password: "Azerty012345!",
      });
    expect(response.status).toBe(HttpStatus.OK);
  });

  it("should deny login for valid structure login/password", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/structures/auth/login")
      .send({
        email: "s3-instructeur@yopmail.com",
        password: "WrongPassword10",
      });
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("should return bad request because password pattern is not valid", async () => {
    const response = await supertest(context.app.getHttpServer())
      .post("/structures/auth/login")
      .send({
        email: "s3-instructeur@yopmail.com",
        password: "INVALID_PASS",
      });
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
