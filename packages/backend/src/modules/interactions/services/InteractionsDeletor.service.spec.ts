import { InteractionsDeletor, interactionsCreator } from ".";
import {
  userStructureRepository,
  structureRepository,
  usagerRepository,
} from "../../../database";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  JEST_FAKE_TIMER,
} from "../../../util/test";

import { InteractionDto } from "../dto";
import { InteractionsModule } from "../interactions.module";
import { Usager, Structure, UserStructure } from "@domifa/common";

describe("InteractionsDeletor", () => {
  let context: AppTestContext;

  let interactionsDeletor: InteractionsDeletor;

  let user: UserStructure;
  let usager: Usager;
  let structure: Structure;
  let firstDateInteraction: Date;
  const MOCKED_NEW_DATE = "2022-12-12T19:45:30.000Z";

  beforeAll(async () => {
    jest
      .useFakeTimers(JEST_FAKE_TIMER)
      .setSystemTime(new Date(MOCKED_NEW_DATE));

    context = await AppTestHelper.bootstrapTestApp({
      imports: [
        InteractionsModule,
        UsagersModule,
        UsersModule,
        StructuresModule,
      ],
    });
    interactionsDeletor =
      context.module.get<InteractionsDeletor>(InteractionsDeletor);

    user = await userStructureRepository.findOneBy({
      id: 1,
    });
    usager = await usagerRepository.findOneBy({
      ref: 6,
      structureId: 1,
    });
    structure = await structureRepository.findOneBy({
      id: 1,
    });
    user.structure = structure;
    const lastInteraction = { ...usager.lastInteraction };
    firstDateInteraction = new Date(lastInteraction.dateInteraction);
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(interactionsDeletor).toBeDefined();
  });

  it("Réception, suppression de 5 colis", async () => {
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

    expect(usagerAfterCreate.lastInteraction.colisIn).toEqual(5);

    const usagerAfterDelete = await interactionsDeletor.deleteInteraction({
      interaction: interactionCreated,
      usager: usagerAfterCreate,
      structure,
    });
    expect(usagerAfterDelete.lastInteraction.colisIn).toEqual(
      usager.lastInteraction.colisIn
    );
  });

  it("Distribution: doit mettre à jour la date de dernier passage", async () => {
    usager = await usagerRepository.findOneBy({
      ref: 6,
      structureId: 1,
    });

    const interaction1 = new InteractionDto();
    interaction1.type = "colisIn";
    interaction1.nbCourrier = 9;
    const { usager: newUsager } = await interactionsCreator.createInteraction({
      interaction: interaction1,
      usager,
      user,
    });

    // Changement de la date par défaut pour la distribution
    jest
      .useFakeTimers(JEST_FAKE_TIMER)
      .setSystemTime(new Date("2023-01-12T19:45:30.000Z"));

    const interaction: InteractionDto = {
      type: "colisOut",
      content: "Distribution de colis sans procuration",
      nbCourrier: 9,
      structureId: 1,
      userId: 1,
      usagerRef: usager.ref,
      userName: "Nom",
      dateInteraction: new Date(),
      returnToSender: false,
    };

    const resultat = await interactionsCreator.createInteraction({
      usager: newUsager,
      user,
      interaction,
    });

    expect(resultat.usager.lastInteraction.colisIn).toEqual(0);
    expect(new Date(resultat.usager.lastInteraction.dateInteraction)).toEqual(
      new Date()
    );

    const test = await interactionsDeletor.deleteInteraction({
      usager: resultat.usager,
      structure,
      interaction: resultat.interaction,
    });

    expect(new Date(test.lastInteraction.dateInteraction)).toEqual(
      firstDateInteraction
    );
    expect(test.lastInteraction.colisIn).toEqual(9);
  });
});
