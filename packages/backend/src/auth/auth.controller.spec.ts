import { forwardRef } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppTestContext, AppTestHelper } from "../util/test";
import { appTypeormManager } from "../database/appTypeormManager.service";
import { DatabaseModule } from "../database/database.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("Auth Controller", () => {
  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [AuthController],
      imports: [DatabaseModule, forwardRef(() => UsersModule), UsagersModule],
      providers: [{ provide: AuthService, useValue: {} }],
    });
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {

    const controller = context.module.get<AuthController>(AuthController);

    expect(controller).toBeDefined();
  });
});
