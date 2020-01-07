import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersService } from "../usagers/services/usagers.service";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersService } from "../users/services/users.service";
import { UsersModule } from "../users/users.module";
import { InteractionDto } from "./interactions.dto";
import { InteractionsModule } from "./interactions.module";
import { InteractionsProviders } from "./interactions.providers";
import { InteractionsService } from "./interactions.service";

describe("InteractionsService", () => {
  let service: InteractionsService;
  let userService: UsersService;

  let usagerService: UsagersService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        InteractionsModule,
        UsagersModule,
        UsersModule,
        StructuresModule
      ],
      providers: [InteractionsService, ...InteractionsProviders]
    }).compile();

    service = app.get<InteractionsService>(InteractionsService);
    userService = app.get<UsersService>(UsersService);
    usagerService = app.get<UsagersService>(UsagersService);
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

    const user = await userService.findOne({ id: 1 });
    const usager = await usagerService.findById(1, 1);

    /* COURRIER A ZERO */
    await service.create(usager, user, interaction);

    expect(usager.lastInteraction.nbCourrier).toEqual(0);

    interaction.type = "courrierIn";
    interaction.content = "Les impôts";
    interaction.nbCourrier = 10;
    await service.create(usager, user, interaction);

    interaction.type = "courrierIn";
    interaction.content = "Le Loyer";
    interaction.nbCourrier = 5;

    const usager2 = await service.create(usager, user, interaction);
    expect(usager2.lastInteraction.nbCourrier).toEqual(15);
  }, 30000);
});
