import { Connection } from "typeorm";
import { appTypeormManager } from "../database/appTypeormManager.service";

import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersService } from "../usagers/services/usagers.service";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersService } from "../users/services/users.service";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { InteractionDto } from "./interactions.dto";
import { InteractionsModule } from "./interactions.module";

import { InteractionsService } from "./interactions.service";

import { Usager } from "../usagers/interfaces/usagers";
import { User } from "../users/user.interface";

describe("InteractionsService", () => {
  let context: AppTestContext;

  let interactionService: InteractionsService;
  let userService: UsersService;
  let usagerService: UsagersService;

  let user: User;
  let usager: Usager;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [
        DatabaseModule,
        InteractionsModule,
        UsagersModule,
        UsersModule,
        StructuresModule,
      ],
      providers: [InteractionsService, UsersService],
    });
    interactionService = context.module.get<InteractionsService>(
      InteractionsService
    );

    userService = context.module.get<UsersService>(UsersService);

    usagerService = context.module.get<UsagersService>(UsagersService);

    user = await userService.findOne({ id: 1 });
    usager = await usagerService.findById(1, 1);
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(interactionService).toBeDefined();
  });

  it("1. Distribution d'un courrier", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierOut";
    interaction.content = "Retrait du courrier";
    const resultat = await interactionService.create(usager, user, interaction);
    expect(resultat.lastInteraction.courrierIn).toEqual(0);
  });

  it("2. Réception de 15 courriers", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierIn";
    interaction.content = "Les impôts";
    interaction.nbCourrier = 10;
    await interactionService.create(usager, user, interaction);

    const secondInteraction = new InteractionDto();
    secondInteraction.type = "courrierIn";
    secondInteraction.content = "Le Loyer";
    secondInteraction.nbCourrier = 5;
    const usager2 = await interactionService.create(
      usager,
      user,
      secondInteraction
    );
    expect(usager2.lastInteraction.courrierIn).toEqual(15);
  });

  it("2. Réception et distribution de 10 courriers", async () => {
    const interaction = new InteractionDto();
    interaction.type = "colisIn";
    interaction.content = "Colis d'un distributeur";
    interaction.nbCourrier = 1;

    const usager3 = await interactionService.create(usager, user, interaction);
    expect(usager3.lastInteraction.colisIn).toEqual(7);

    const distribution = new InteractionDto();
    distribution.type = "colisOut";
    const usager2 = await interactionService.create(usager, user, distribution);
    expect(usager2.lastInteraction.colisIn).toEqual(0);
  });
});
