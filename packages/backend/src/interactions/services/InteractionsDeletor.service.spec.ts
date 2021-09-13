import {
  structureRepository,
  usagerRepository,
  userStructureRepository,
} from "../../database";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { Structure, Usager, UserStructure } from "../../_common/model";
import { InteractionDto } from "../interactions.dto";
import { InteractionsModule } from "../interactions.module";
import { InteractionsService } from "./interactions.service";
import { interactionsCreator } from "./interactionsCreator.service";
import { InteractionsDeletor } from "./InteractionsDeletor.service";

describe("InteractionsDeletor", () => {
  let context: AppTestContext;

  let interactionsDeletor: InteractionsDeletor;
  let interactionsService: InteractionsService;

  let user: UserStructure;
  let usager: Usager;
  let structure: Structure;

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
    user = await userStructureRepository.findOne({ id: 1 });
    usager = await usagerRepository.findOne({
      ref: 2,
      structureId: 1,
    });
    structure = await structureRepository.findOne({
      id: 1,
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
      await interactionsCreator.createInteraction({
        interaction: interaction1,
        usager,
        user,
      });

    expect(usagerAfterCreate.lastInteraction.colisIn).toEqual(
      usagerBefore.lastInteraction.colisIn + 5
    );

    {
      const usagerAfterDelete =
        await interactionsDeletor.deleteOrRestoreInteraction({
          interaction: interactionCreated,
          usager: usagerAfterCreate,
          user,
          structure,
        });
      expect(usagerAfterDelete.lastInteraction.colisIn).toEqual(
        usagerBefore.lastInteraction.colisIn
      );
    }
  });
});
