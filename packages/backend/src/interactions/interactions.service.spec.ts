import { usagerRepository, usersRepository } from "../database";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { AppUser, Usager } from "../_common/model";
import { InteractionDto } from "./interactions.dto";
import { InteractionsModule } from "./interactions.module";
import { InteractionsService } from "./interactions.service";

describe("InteractionsService", () => {
  let context: AppTestContext;

  let interactionsService: InteractionsService;

  let user: AppUser;
  let usager: Usager;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [
        InteractionsModule,
        UsagersModule,
        UsersModule,
        StructuresModule,
      ],
      providers: [InteractionsService],
    });
    interactionsService = context.module.get<InteractionsService>(
      InteractionsService
    );

    user = await usersRepository.findOne({ id: 1 });
    usager = await usagerRepository.findOne({
      ref: 1,
      structureId: 1,
    });
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(interactionsService).toBeDefined();
  });

  it("1. Distribution d'un courrier", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierOut";
    interaction.content = "Retrait du courrier";
    interaction.nbCourrier = 0;
    const resultat = await interactionsService.create({
      usager,
      user,
      interaction,
    });
    expect(resultat.lastInteraction.courrierIn).toEqual(0);
  });

  it("2. Réception de 15 courriers", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierIn";
    interaction.content = "Les impôts";
    interaction.nbCourrier = 10;

    await interactionsService.create({
      usager,
      user,
      interaction,
    });

    const secondInteraction = new InteractionDto();
    secondInteraction.type = "courrierIn";
    secondInteraction.content = "Le Loyer";
    secondInteraction.nbCourrier = 5;
    const usager2 = await interactionsService.create({
      usager,
      user,
      interaction: secondInteraction,
    });
    expect(usager2.lastInteraction.courrierIn).toEqual(15);
  });

  it("2. Réception et distribution de 10 courriers", async () => {
    const interaction = new InteractionDto();
    interaction.type = "colisIn";
    interaction.content = "Colis d'un distributeur";
    interaction.nbCourrier = 1;

    const usagerBefore = await usagerRepository.findOne({
      ref: 1,
      structureId: 1,
    });

    const usager3 = await interactionsService.create({
      usager,
      user,
      interaction,
    });
    expect(usager3.lastInteraction.colisIn).toEqual(
      usagerBefore.lastInteraction.colisIn + 1
    );

    const distribution = new InteractionDto();
    distribution.type = "colisOut";
    const usager2 = await interactionsService.create({
      usager,
      user,
      interaction: distribution,
    });
    expect(usager2.lastInteraction.colisIn).toEqual(0);
  });
});
