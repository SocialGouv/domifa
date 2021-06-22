import { usagerRepository, usersRepository } from "../../database";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { AppUser, Usager } from "../../_common/model";
import { InteractionDto } from "../interactions.dto";
import { InteractionsModule } from "../interactions.module";
import { InteractionsService } from "./interactions.service";
import { InteractionsDeletor } from "./InteractionsDeletor.service";

describe("InteractionsService", () => {
  let context: AppTestContext;

  let interactionsDeletor: InteractionsDeletor;
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
    interactionsDeletor =
      context.module.get<InteractionsDeletor>(InteractionsDeletor);

    interactionsService =
      context.module.get<InteractionsService>(InteractionsService);
    user = await usersRepository.findOne({ id: 1 });
    usager = await usagerRepository.findOne({
      ref: 2,
      structureId: 1,
    });
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(interactionsDeletor).toBeDefined();
    expect(interactionsService).toBeDefined();
  });

  it("Réception, suppression et restauration de 5 colis", async () => {
    const usagerBefore = await usagerRepository.findOne({
      ref: 2,
      structureId: 1,
    });

    const interaction1 = new InteractionDto();
    interaction1.type = "colisIn";
    interaction1.content = "Colis d'un distributeur";
    interaction1.nbCourrier = 5;
    const { usager: usagerAfterCreate, interaction: interactionCreated } =
      await interactionsService.create({
        usager,
        user,
        interaction: interaction1,
      });
    expect(usagerAfterCreate.lastInteraction.colisIn).toEqual(
      usagerBefore.lastInteraction.colisIn + 5
    );

    {
      const usagerAfterDelete = await interactionsDeletor.deleteInteraction({
        interactionId: interactionCreated.id,
        usagerRef: usager.ref,
        user,
      });
      expect(usagerAfterDelete.lastInteraction.colisIn).toEqual(
        usagerBefore.lastInteraction.colisIn
      );
    }
  });
});
