import { UserStructureSecurity } from "./../_common/model/user-structure/UserStructureSecurity.type";
import { HttpModule } from "@nestjs/axios";
import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";
import { userStructureSecurityRepository } from "../database";
import { MailsModule } from "../mails/mails.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { ExpressResponse } from "../util/express";
import { AppTestContext, AppTestHelper } from "../util/test";
import { UsersPublicController } from "./users.public.controller";

describe("Users Public Controller", () => {
  let controller: UsersPublicController;
  let context: AppTestContext;
  let userSecurityDatas: UserStructureSecurity;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsersPublicController],
      imports: [MailsModule, StructuresModule, UsagersModule, HttpModule],
      providers: [],
    });
    controller = context.module.get<UsersPublicController>(
      UsersPublicController
    );

    userSecurityDatas = await userStructureSecurityRepository.findOneBy({
      userId: 1,
    });
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });
  describe("Users Public Controller", () => {
    it("should be defined", async () => {
      expect(controller).toBeDefined();
    });

    it("validateEmail does not exists", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as ExpressResponse;

      await controller.validateEmail(
        {
          email: "test-mail-does-not-exists@yopmail.com",
        },
        res
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(false);
    });

    it("validateEmail exists", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as ExpressResponse;

      await controller.validateEmail(
        {
          email: "s1-admin@yopmail.com",
        },
        res
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(true);
    });
  });

  describe("Test request password link : /users/get-password-token", () => {
    it("❌  Request fail /users/get-password-token", async () => {
      let responseFail = await supertest(context.app.getHttpServer())
        .post("/users/get-password-token")
        .send({
          email: "fake-email-admin@yopmail.com",
        });
      // Always return OK if email is valid
      expect(responseFail.status).toBe(HttpStatus.OK);

      responseFail = await supertest(context.app.getHttpServer())
        .post("/users/get-password-token")
        .send({
          email: "XXXX",
        });
      expect(responseFail.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("✅  Request OK /users/get-password-token", async () => {
      const responseFail = await supertest(context.app.getHttpServer())
        .post("/users/get-password-token")
        .send({
          email: "s1-admin@yopmail.com",
        });

      expect(responseFail.status).toBe(HttpStatus.OK);

      // s1-admin@yopmail.com  = userId 1
      userSecurityDatas = await userStructureSecurityRepository.findOneBy({
        userId: 1,
      });
      expect(userSecurityDatas.temporaryTokens).toBeDefined();
      expect(userSecurityDatas.temporaryTokens?.type).toBe("reset-password");
    });
  });
  describe("Test check-password token : /users/check-password-token", () => {
    it("❌ 1. Request FAIL /users/get-password-token", async () => {
      // 1. Fake id and fake token
      let responseFail = await supertest(context.app.getHttpServer()).get(
        "/users/check-password-token/10/xxx"
      );
      expect(responseFail.status).toBe(HttpStatus.BAD_REQUEST);

      // 2. Good id, fake token
      responseFail = await supertest(context.app.getHttpServer()).get(
        "/users/check-password-token/1/xe50485a8da21b0917c1a3aaeaa32d8ad77b0f59c45x"
      );
      expect(responseFail.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("✅ 2. Request OK /users/get-password-token", async () => {
      // 1. Good id and good token

      const responseOk = await supertest(context.app.getHttpServer()).get(
        "/users/check-password-token/1/" +
          userSecurityDatas.temporaryTokens.token
      );
      expect(responseOk.status).toBe(HttpStatus.OK);
    });
  });

  describe("Test update password form : /users/reset-password", () => {
    it("❌ Request fail /users/reset-password", async () => {
      let responseFail = await supertest(context.app.getHttpServer())
        .post("/users/reset-password")
        .send({
          password: 111122,
          passwordConfirmation: 111122,
          token: userSecurityDatas.temporaryTokens.token,
          userId: "1",
        });
      // Always return OK if email is valid
      expect(responseFail.status).toBe(HttpStatus.BAD_REQUEST);

      responseFail = await supertest(context.app.getHttpServer())
        .post("/users/reset-password")
        .send({
          password: "xxxxxxxxxxxxx",
          passwordConfirmation: "xxxxxxxxxxxxx",
          token: userSecurityDatas.temporaryTokens.token,
          userId: "1",
        });
      expect(responseFail.status).toBe(HttpStatus.BAD_REQUEST);

      responseFail = await supertest(context.app.getHttpServer())
        .post("/users/reset-password")
        .send({
          password: "Azertyu0101010101",
          passwordConfirmation: "zqdzAioj!z!qdzqdoij oijzqoidj",
          token: userSecurityDatas.temporaryTokens.token,
          userId: "1",
        });
      expect(responseFail.status).toBe(HttpStatus.BAD_REQUEST);
      expect(responseFail.body?.message).toBe("PASSWORD_NOT_MATCH");
    });

    it("✅  Request OK /users/reset-password", async () => {
      const responseOk = await supertest(context.app.getHttpServer())
        .post("/users/reset-password")
        .send({
          password: "Azerty012345",
          passwordConfirmation: "Azerty012345",
          token: userSecurityDatas.temporaryTokens.token,
          userId: "1",
        });
      expect(responseOk.status).toBe(HttpStatus.OK);
      expect(responseOk.body?.message).toBe("OK");
    });
  });
});
