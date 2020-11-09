import { HttpModule } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { MailsModule } from "../mails/mails.module";
import { CronMailsService } from "../mails/services/cron-mails.service";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { UsersService } from "./services/users.service";
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
      providers: [
        { provide: UsersService, useValue: {} },
        CronMailsService,

        ...UsersProviders,
      ],
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
