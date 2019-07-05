import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { InteractionDto } from "./interactions.dto";
import { InteractionsModule } from "./interactions.module";
import { InteractionsProviders } from "./interactions.providers";
import { InteractionsService } from "./interactions.service";

describe("InteractionsService", () => {
  let service: InteractionsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        InteractionsModule,
        UsagersModule,
        UsersModule,
        StructuresModule
      ],
      providers: [InteractionsService, ...InteractionsProviders]
    }).compile();

    service = module.get<InteractionsService>(InteractionsService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("Create", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierOut";
    interaction.content = "Les impôts";

    /* COURRIER A ZERO */
    const usager = await service.create(2, interaction);
    service.create(2, interaction);
    expect(await usager.lastInteraction.nbCourrier).toEqual(0);

    interaction.type = "courrierIn";
    interaction.content = "Les impôts";
    interaction.nbCourrier = 10;
    await service.create(2, interaction);

    interaction.type = "courrierIn";
    interaction.content = "Le Loyer";
    interaction.nbCourrier = 5;
    const usager2 = await service.create(2, interaction);
    expect(await usager2.lastInteraction.nbCourrier).toEqual(15);
  }, 30000);
});
