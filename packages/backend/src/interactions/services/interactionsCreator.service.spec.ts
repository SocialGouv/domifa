import { addDays } from "date-fns";
import MockDate from "mockdate";

import {
  interactionsCreator,
  InteractionsDeletor,
  InteractionsService,
} from ".";
import {
  structureRepository,
  usagerRepository,
  interactionRepository,
  userStructureRepository,
} from "../../database";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { Usager, UserStructure } from "../../_common/model";
import { InteractionDto } from "../dto";
import { InteractionsModule } from "../interactions.module";

describe("interactionsCreator", () => {
  let context: AppTestContext;

  let interactionsDeletor: InteractionsDeletor;

  let user: UserStructure;
  let usager: Usager;
  let structure;

  beforeAll(async () => {
    // On défini la valeur que devrait avoir new Date();
    MockDate.set("2020-12-01T10:00:24.980Z");

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

    user = await userStructureRepository.findOne({ id: 1 });

    // Reset des courriers
    await interactionRepository.deleteByCriteria({
      usagerRef: 2,
      structureId: 1,
    });

    // Reset les courriers
    usager = await usagerRepository.updateOne(
      {
        ref: 2,
        structureId: 1,
      },
      {
        lastInteraction: {
          dateInteraction: new Date("2020-12-01T14:11:28.167Z"),
          enAttente: false,
          courrierIn: 0,
          recommandeIn: 0,
          colisIn: 0,
        },
      }
    );

    structure = await structureRepository.findOne({
      id: 1,
    });
  });

  afterAll(async () => {
    // Reset de new Date()
    MockDate.reset();

    await AppTestHelper.tearDownTestApp(context);
  });

  it("1. Réception de 15 courriers", async () => {
    const newusager = await usagerRepository.findOne({
      ref: 2,
      structureId: 1,
    });

    const interaction = new InteractionDto();
    interaction.type = "courrierIn";
    interaction.content = "Les impôts";
    interaction.nbCourrier = 10;
    interaction.dateInteraction = new Date();

    const firstInteraction = await interactionsCreator.createInteraction({
      usager: newusager,
      interaction,
      user,
    });

    expect(firstInteraction.usager.lastInteraction.courrierIn).toEqual(10);

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
    expect(resultat.usager.lastInteraction.enAttente).toEqual(true);

    // clean
    const deleteSecondInteraction =
      await interactionsDeletor.deleteOrRestoreInteraction({
        interaction: resultat.interaction,
        structure,
        usager,
        user,
      });

    expect(deleteSecondInteraction.lastInteraction.courrierIn).toEqual(10);

    // clean
    const deletedFirstInteraction =
      await interactionsDeletor.deleteOrRestoreInteraction({
        interaction: firstInteraction.interaction,
        structure,
        usager,
        user,
      });

    expect(deletedFirstInteraction.lastInteraction.courrierIn).toEqual(0);
  });

  it("2. Distribution d'un courrier", async () => {
    const interactionIn = new InteractionDto();
    interactionIn.type = "colisIn";
    interactionIn.content = "Colis à donner en urgence";
    interactionIn.nbCourrier = 3;
    interactionIn.dateInteraction = new Date();

    const createdInteractionIn = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction: interactionIn,
    });
    expect(createdInteractionIn.usager.lastInteraction.colisIn).toEqual(3);

    const interactionOut = new InteractionDto();
    interactionOut.type = "colisOut";
    interactionOut.content = "Retrait du courrier";
    interactionOut.nbCourrier = 0;
    interactionOut.dateInteraction = new Date();

    const resultat = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction: interactionOut,
    });

    expect(resultat.usager.lastInteraction.colisIn).toEqual(0);

    // clean
    await interactionsDeletor.deleteOrRestoreInteraction({
      interaction: resultat.interaction,
      structure,
      usager,
      user,
    });
  });

  it("3. Appels & visites", async () => {
    const interaction = new InteractionDto();
    interaction.type = "visite";
    const resultat = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction,
    });

    expect(resultat.usager.lastInteraction.dateInteraction).toEqual(
      "2020-12-01T10:00:24.980Z"
    );
  });

  it("4. Distribution d'un courrier avec transfert", async () => {
    const interaction = new InteractionDto();

    interaction.type = "courrierOut";
    interaction.content = "Test transfert du courrier";
    interaction.nbCourrier = 10;

    // Date de dernier passage avant toute modif
    const dernierPassage = usager.lastInteraction.dateInteraction;

    usager.options.transfert.actif = true;
    usager.options.transfert.adresse = "ICI ADRESSE";
    usager.options.transfert.nom = "LA personne DU TRANSFERT";
    usager.options.transfert.dateFin = addDays(new Date(), 10);
    interaction.dateInteraction = new Date();

    const resultat = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction,
    });

    expect(resultat.interaction.content).toEqual(
      "Courrier transféré à : LA personne DU TRANSFERT - ICI ADRESSE"
    );

    // La date de dernier passage est mise à jour
    expect(new Date(resultat.usager.lastInteraction.dateInteraction)).toEqual(
      interaction.dateInteraction
    );

    // Suppression de l'interaction sortante
    const usagerAfterDelete =
      await interactionsDeletor.deleteOrRestoreInteraction({
        interaction: resultat.interaction,
        structure,
        usager,
        user,
      });

    // Après suppression, date de dernier passage doit être la même qu'au début
    expect(new Date(usagerAfterDelete.lastInteraction.dateInteraction)).toEqual(
      dernierPassage
    );
  });

  it("5. Distribution d'un courrier avec procuration ", async () => {
    const interaction = new InteractionDto();
    const lastInteractionDateBefore = "2018-02-01T10:00:00.980Z";
    usager.lastInteraction.dateInteraction = new Date(
      lastInteractionDateBefore
    );

    interaction.type = "courrierOut";
    interaction.content = "Test transfert du courrier";
    interaction.nbCourrier = 10;
    interaction.procuration = true;
    interaction.dateInteraction = new Date();

    usager.options.transfert.actif = false;

    usager.options.procurations = [
      {
        nom: "Procuration",
        prenom: "Jean michel",
        dateNaissance: new Date("2000-02-01T10:00:00.980Z"),
        dateDebut: addDays(new Date(), 10),
        dateFin: addDays(new Date(), 30),
      },
    ];

    const resultat = await interactionsCreator.createInteraction({
      usager,
      user,
      interaction,
    });

    expect(resultat.interaction.content).toEqual(
      "Courrier remis au mandataire : Jean michel PROCURATION"
    );

    // La date de dernier passage ne doit pas se mettre à jour car c'est une procuration
    expect(resultat.usager.lastInteraction.dateInteraction).toEqual(
      lastInteractionDateBefore
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
