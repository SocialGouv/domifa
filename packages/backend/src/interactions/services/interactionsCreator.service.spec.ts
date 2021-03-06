import {
  structureRepository,
  usagerRepository,
  usersRepository,
} from "../../database";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { AppUser, Usager } from "../../_common/model";
import { InteractionDto } from "../interactions.dto";
import { InteractionsModule } from "../interactions.module";
import { InteractionsService } from "./interactions.service";
import { interactionsCreator } from "./interactionsCreator.service";
import { InteractionsDeletor } from "./InteractionsDeletor.service";

describe("interactionsCreator", () => {
  let context: AppTestContext;

  let interactionsDeletor: InteractionsDeletor;

  let user: AppUser;
  let usager: Usager;
  let structure;

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

    user = await usersRepository.findOne({ id: 1 });
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

  it("1. Distribution d'un courrier", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierOut";
    interaction.content = "Retrait du courrier";
    interaction.nbCourrier = 0;
    const resultat = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction,
    });
    expect(resultat.usager.lastInteraction.courrierIn).toEqual(0);

    // clean
    await interactionsDeletor.deleteOrRestoreInteraction({
      interactionId: resultat.interaction.id,
      structure,
      usagerRef: usager.ref,
      user,
    });
  });

  it("2. Réception de 15 courriers", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierIn";
    interaction.content = "Les impôts";
    interaction.nbCourrier = 10;

    await interactionsCreator.createInteraction({
      usager,
      user,
      interaction,
    });

    const secondInteraction = new InteractionDto();
    secondInteraction.type = "courrierIn";
    secondInteraction.content = "Le Loyer";
    secondInteraction.nbCourrier = 5;
    const resultat = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction: secondInteraction,
    });
    expect(resultat.usager.lastInteraction.courrierIn).toEqual(15);

    // clean
    await interactionsDeletor.deleteOrRestoreInteraction({
      interactionId: resultat.interaction.id,
      structure,
      usagerRef: usager.ref,
      user,
    });
  });

  it("2. Réception et distribution de 1 courriers", async () => {
    const interaction = new InteractionDto();
    interaction.type = "colisIn";
    interaction.content = "Colis d'un distributeur";
    interaction.nbCourrier = 1;

    const usagerBefore = await usagerRepository.findOne({
      ref: 2,
      structureId: 1,
    });

    const resultat1 = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction,
    });
    expect(resultat1.usager.lastInteraction.colisIn).toEqual(
      usagerBefore.lastInteraction.colisIn + 1
    );

    // clean
    await interactionsDeletor.deleteOrRestoreInteraction({
      interactionId: resultat1.interaction.id,
      structure,
      usagerRef: usager.ref,
      user,
    });

    const distribution = new InteractionDto();
    distribution.type = "colisOut";
    const resultat2 = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction: distribution,
    });
    expect(resultat2.usager.lastInteraction.colisIn).toEqual(0);

    // clean
    await interactionsDeletor.deleteOrRestoreInteraction({
      interactionId: resultat2.interaction.id,
      structure,
      usagerRef: usager.ref,
      user,
    });
  });
});
