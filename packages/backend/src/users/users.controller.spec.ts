import { HttpModule } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../database/database.module";
import { MailsModule } from "../mails/mails.module";
import { CronMailsService } from "../mails/services/cron-mails.service";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";

describe("Users Controller", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    const controller = module.get<UsersController>(UsersController);
    expect(controller).toBeDefined();
  });
});
