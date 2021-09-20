import { HttpModule } from "@nestjs/axios";
import { MailsModule } from "../mails/mails.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { UsersController } from "./users.controller";

describe("Users Controller", () => {
  let controller: UsersController;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsersController],
      imports: [MailsModule, StructuresModule, UsagersModule, HttpModule],
      providers: [],
    });
    controller = context.module.get<UsersController>(UsersController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    expect(controller).toBeDefined();
  });
});
