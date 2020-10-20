import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "../config/config.service";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";

import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";
import { CronMailsService } from "../mails/services/cron-mails.service";
import { HttpModule } from "@nestjs/common";
import { UsersProviders } from "./users.providers";
import { DatabaseModule } from "../database/database.module";
import { MailsModule } from "../mails/mails.module";

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

        ConfigService,
        ...UsersProviders,
      ],
    }).compile();

    const controller = module.get<UsersController>(UsersController);
    expect(controller).toBeDefined();
  });
});
