import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "../config/config.service";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { MailerService } from "./services/mailer.service";
import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";

describe("Users Controller", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      imports: [StructuresModule, UsagersModule],
      providers: [
        { provide: UsersService, useValue: {} },
        MailerService,
        ConfigService
      ]
    }).compile();

    const controller = module.get<UsersController>(UsersController);
    expect(controller).toBeDefined();
  });
});
