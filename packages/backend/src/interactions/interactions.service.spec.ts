import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";
import { appTypeormManager } from "../database/appTypeormManager.service";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersService } from "../usagers/services/usagers.service";
import { UsagersModule } from "../usagers/usagers.module";
import { usersRepository } from "../users/pg/users-repository.service";
import { UsersService } from "../users/services/users.service";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from '../util/test';
import { InteractionDto } from "./interactions.dto";
import { InteractionsModule } from "./interactions.module";
import { InteractionsProviders } from "./interactions.providers";
import { InteractionsService } from "./interactions.service";

describe("InteractionsService", () => {
  let service: InteractionsService;
  let userService: UsersService;

  let usagerService: UsagersService;
  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [
        DatabaseModule,
        InteractionsModule,
        UsagersModule,
        UsersModule,
        StructuresModule,
      ],
      providers: [InteractionsService, UsersService, ...InteractionsProviders],
    }); 
    service = context.module.get<InteractionsService>(InteractionsService);
    userService = context.module.get<UsersService>(UsersService);
    usagerService = context.module.get<UsagersService>(UsagersService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("Create", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierOut";
    interaction.content = "Les impôts";

    const user = await usersRepository.findOne({ id: 1 });
    const usager = await usagerService.findById(1, 1);

    /* COURRIER A ZERO */
    await service.create(usager, user, interaction);

    expect(usager.lastInteraction.courrierIn).toEqual(0);

    interaction.type = "courrierIn";
    interaction.content = "Les impôts";
    interaction.nbCourrier = 10;
    await service.create(usager, user, interaction);

    interaction.type = "courrierIn";
    interaction.content = "Le Loyer";
    interaction.nbCourrier = 5;

    const usager2 = await service.create(usager, user, interaction);
    expect(usager2.lastInteraction.courrierIn).toEqual(15);
  }, 30000);
});
