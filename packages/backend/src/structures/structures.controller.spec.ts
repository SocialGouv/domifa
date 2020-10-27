import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../database/database.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StructuresService } from "./services/structures.service";
import { StructuresController } from "./structures.controller";

describe("Stuctures Controller", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StructuresController],
      imports: [
        DatabaseModule,
        UsersModule,
        MailsModule,
        UsagersModule,
        InteractionsModule,
      ],
      providers: [{ provide: StructuresService, useValue: {} }],
    }).compile();

    const controller = module.get<StructuresController>(StructuresController);
    expect(controller).toBeDefined();
  });
});
