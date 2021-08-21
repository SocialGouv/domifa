import moment = require("moment");
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
    interaction.dateInteraction = new Date();

    const resultat = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction,
    });

    expect(resultat.usager.lastInteraction.courrierIn).toEqual(0);

    // clean
    await interactionsDeletor.deleteOrRestoreInteraction({
      interaction: resultat.interaction,
      structure,
      usager,
      user,
    });
  });

  it("2. Réception de 15 courriers", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierIn";
    interaction.content = "Les impôts";
    interaction.nbCourrier = 10;
    interaction.dateInteraction = new Date();

    await interactionsCreator.createInteraction({
      usager,
      user,
      interaction,
    });

    const secondInteraction = new InteractionDto();
    secondInteraction.type = "courrierIn";
    secondInteraction.content = "Le Loyer";
    secondInteraction.nbCourrier = 5;
    interaction.dateInteraction = new Date();
    const resultat = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction: secondInteraction,
    });
    expect(resultat.usager.lastInteraction.courrierIn).toEqual(15);

    // clean
    await interactionsDeletor.deleteOrRestoreInteraction({
      interaction: resultat.interaction,
      structure,
      usager,
      user,
    });
  });

  it("3. Réception et distribution de 1 courriers", async () => {
    const interaction = new InteractionDto();
    interaction.type = "colisIn";
    interaction.content = "Colis d'un distributeur";
    interaction.nbCourrier = 1;
    interaction.dateInteraction = new Date();
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
      interaction: resultat1.interaction,
      structure,
      usager,
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
      interaction: resultat2.interaction,
      structure,
      usager,
      user,
    });
  });

  it("4. Distribution d'un courrier avec transfert", async () => {
    const interaction = new InteractionDto();

    interaction.type = "courrierOut";
    interaction.content = "Test transfert du courrier";
    interaction.nbCourrier = 10;

    usager.options.transfert.actif = true;
    usager.options.transfert.adresse = "ICI ADRESSE";
    usager.options.transfert.nom = "LA personne DU TRANSFERT";
    usager.options.transfert.dateFin = moment().add(10, "days").toDate();
    interaction.dateInteraction = new Date();

    const resultat = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction,
    });

    expect(resultat.interaction.content).toEqual(
      "Courrier transféré à : LA personne DU TRANSFERT - ICI ADRESSE"
    );

    // clean
    await interactionsDeletor.deleteOrRestoreInteraction({
      interaction: resultat.interaction,
      structure,
      usager,
      user,
    });
  });

  it("5. Distribution d'un courrier avec procuration", async () => {
    const interaction = new InteractionDto();

    interaction.type = "courrierOut";
    interaction.content = "Test transfert du courrier";
    interaction.nbCourrier = 10;
    interaction.procuration = true;
    interaction.dateInteraction = new Date();

    usager.options.transfert.actif = false;

    usager.options.procuration.actif = true;
    usager.options.procuration.nom = "Procuration";
    usager.options.procuration.prenom = "Jean michel";
    usager.options.procuration.dateFin = moment().add(10, "days").toDate();

    const resultat = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction,
    });

    expect(resultat.interaction.content).toEqual(
      "Courrier remis au mandataire : Jean michel PROCURATION"
    );

    // clean
    await interactionsDeletor.deleteOrRestoreInteraction({
      interaction: resultat.interaction,
      structure,
      usager,
      user,
    });
  });
});
