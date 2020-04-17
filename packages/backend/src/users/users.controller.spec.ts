import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "../config/config.service";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { MailJetService } from "./services/mailjet.service";
import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";
import { TipimailService } from "./services/tipimail.service";
import { HttpModule } from "@nestjs/common";
import { UsersProviders } from "./users.providers";
import { DatabaseModule } from "../database/database.module";

describe("Users Controller", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      imports: [DatabaseModule, StructuresModule, UsagersModule, HttpModule],
      providers: [
        { provide: UsersService, useValue: {} },
        TipimailService,
        ...UsersProviders,
        MailJetService,
        ConfigService,
      ],
    }).compile();

    const controller = module.get<UsersController>(UsersController);
    expect(controller).toBeDefined();
  });
});
