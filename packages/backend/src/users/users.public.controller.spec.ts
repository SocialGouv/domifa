import { HttpModule } from "@nestjs/axios";
import { HttpStatus } from "@nestjs/common";
import { MailsModule } from "../mails/mails.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { ExpressResponse } from "../util/express";
import { AppTestContext, AppTestHelper } from "../util/test";
import { UsersPublicController } from "./users.public.controller";

describe("Users Public Controller", () => {
  let controller: UsersPublicController;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsersPublicController],
      imports: [MailsModule, StructuresModule, UsagersModule, HttpModule],
      providers: [],
    });
    controller = context.module.get<UsersPublicController>(
      UsersPublicController
    );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

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
        email: "ccastest@yopmail.com",
      },
      res
    );
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(true);
  });
});
