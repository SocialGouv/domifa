import { HttpModule, HttpStatus } from "@nestjs/common";
import { DatabaseModule } from "../database";
import { MailsModule } from "../mails/mails.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { ExpressResponse } from "../util/express";
import { AppTestContext, AppTestHelper } from "../util/test";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";

describe("Users Controller", () => {
  let controller: UsersController;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsersController],
      imports: [
        DatabaseModule,
        MailsModule,
        StructuresModule,
        UsagersModule,
        HttpModule,
      ],
      providers: [...UsersProviders],
    });
    controller = context.module.get<UsersController>(UsersController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    expect(controller).toBeDefined();
  });

  it("validateEmail does not exists", async () => {
    const res = ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown) as ExpressResponse;

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
    const res = ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown) as ExpressResponse;

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
