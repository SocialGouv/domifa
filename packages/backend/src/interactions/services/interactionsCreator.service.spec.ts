import { SmsModule } from "./../../sms/sms.module";
import { messageSmsRepository } from "./../../database/services/message-sms/messageSmsRepository.service";
import { addDays, differenceInHours, subDays } from "date-fns";
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

  const MOCKED_NEW_DATE = "2021-09-11T09:45:30.000Z";
  const MOCKED_LAST_INTERACTION_DATE = new Date("2020-11-21T14:11:28");

  beforeAll(async () => {
    // On défini la valeur que devrait avoir new Date();
    MockDate.set(MOCKED_NEW_DATE);

    context = await AppTestHelper.bootstrapTestApp({
      imports: [
        InteractionsModule,
        UsagersModule,
        UsersModule,
        SmsModule,
        StructuresModule,
      ],
      providers: [InteractionsService],
    });

    interactionsDeletor =
      context.module.get<InteractionsDeletor>(InteractionsDeletor);

    user = await userStructureRepository.findOne({ id: 1 });
    user.structure = await structureRepository.findOneBy({ id: 1 });
  });

  beforeEach(async () => {
    // Reset des courriers
    await interactionRepository.delete({
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
          dateInteraction: new Date(MOCKED_LAST_INTERACTION_DATE),
          enAttente: false,
          courrierIn: 0,
          recommandeIn: 0,
          colisIn: 0,
        },
      }
    );
  });

  afterAll(async () => {
    MockDate.reset();
    user.structure.sms.enabledByDomifa = false;
    user.structure.sms.enabledByStructure = false;

    await structureRepository.update(
      { id: user.structureId },
      { sms: user.structure.sms }
    );
    await usagerRepository.update({}, { contactByPhone: false });
    await messageSmsRepository.delete({ structureId: user.structureId });
    await AppTestHelper.tearDownTestApp(context);
  });

  describe("1. Réception et distribution simple ", () => {
    it("1. Réception de 15 courriers", async () => {
      //
      // Ajout d'une première interaction
      const newusager = await usagerRepository.findOneBy({
        ref: 2,
        structureId: 1,
      });

      const interaction: InteractionDto = {
        type: "courrierIn",
        content: "Les impôts",
        nbCourrier: 10,
        dateInteraction: new Date(),
      };

      const firstResult = await interactionsCreator.createInteraction({
        usager: newusager,
        interaction,
        user,
      });

      expect(firstResult.usager.lastInteraction.courrierIn).toEqual(10);
      expect(firstResult.usager.lastInteraction.enAttente).toEqual(true);

      // ! La date de dernier passage ne DOIT PAS être mise à jour
      expect(firstResult.usager.lastInteraction.dateInteraction).toEqual(
        newusager.lastInteraction.dateInteraction
      );

      //
      // Ajout d'une seconde interaction

      const secondInteraction: InteractionDto = {
        type: "courrierIn",
        content: "Le Loyer",
        nbCourrier: 5,
        dateInteraction: new Date(),
      };

      const secondResult = await interactionsCreator.createInteraction({
        usager,
        user,
        interaction: secondInteraction,
      });

      expect(secondResult.usager.lastInteraction.courrierIn).toEqual(15);
      expect(secondResult.usager.lastInteraction.enAttente).toEqual(true);

      // ! La date de dernier passage ne DOIT PAS être mise à jour
      expect(secondResult.usager.lastInteraction.dateInteraction).toEqual(
        newusager.lastInteraction.dateInteraction
      );

      // clean
      const deleteSecondInteraction =
        await interactionsDeletor.deleteOrRestoreInteraction({
          interaction: secondResult.interaction,
          structure: user.structure,
          usager,
          user,
        });
      expect(deleteSecondInteraction.lastInteraction.courrierIn).toEqual(10);

      // clean
      const deletedFirstInteraction =
        await interactionsDeletor.deleteOrRestoreInteraction({
          interaction: firstResult.interaction,
          structure: user.structure,
          usager,
          user,
        });
      expect(deletedFirstInteraction.lastInteraction.courrierIn).toEqual(0);
    });

    it("2. Distribution d'un courrier", async () => {
      const interactionIn: InteractionDto = {
        type: "colisIn",
        content: "Colis à donner en urgence",
        nbCourrier: 3,
        dateInteraction: new Date(),
      };

      const createdInteractionIn = await interactionsCreator.createInteraction({
        usager,
        user,
        interaction: interactionIn,
      });

      expect(createdInteractionIn.usager.lastInteraction.colisIn).toEqual(3);

      const interactionOut: InteractionDto = {
        type: "colisOut",
        content: "Retrait du courrier",
        nbCourrier: 0,
        dateInteraction: new Date(),
      };

      const resultat = await interactionsCreator.createInteraction({
        usager,
        user,
        interaction: interactionOut,
      });
      console.log(resultat.usager.lastInteraction);
      expect(resultat.usager.lastInteraction.colisIn).toEqual(0);

      // clean
      await interactionsDeletor.deleteOrRestoreInteraction({
        interaction: resultat.interaction,
        structure: user.structure,
        usager,
        user,
      });
    });
  });

  describe("2. Appels & Visites", () => {
    it("Appels  ", async () => {
      const interaction: InteractionDto = {
        type: "appel",
        nbCourrier: 0,
      };

      const resultat = await interactionsCreator.createInteraction({
        usager,
        user,
        interaction,
      });

      expect(resultat.usager.lastInteraction.dateInteraction).toEqual(
        MOCKED_NEW_DATE
      );
      expect(resultat.interaction.nbCourrier).toEqual(0);
    });

    it("Visite", async () => {
      const interaction: InteractionDto = {
        type: "visite",
        nbCourrier: 1111, // Test avec un faux numéro, on vérifie que c'est bien 0 qui est enregistré
      };

      const resultat = await interactionsCreator.createInteraction({
        usager,
        user,
        interaction,
      });

      expect(resultat.usager.lastInteraction.dateInteraction).toEqual(
        MOCKED_NEW_DATE
      );

      expect(resultat.interaction.nbCourrier).toEqual(0);

      // Suppression de l'interaction sortante
      await interactionsDeletor.deleteOrRestoreInteraction({
        interaction: resultat.interaction,
        structure: user.structure,
        usager,
        user,
      });
    });
  });

  describe("3. Procurations & transferts", () => {
    it("Distribution d'un courrier avec transfert", async () => {
      const interaction: InteractionDto = {
        type: "courrierOut",
        content: "Test transfert du courrier",
        nbCourrier: 10,
        dateInteraction: new Date(),
      };

      // Création d'un transfert
      usager.options.transfert = {
        actif: true,
        adresse: "ICI ADRESSE",
        nom: "LA personne DU TRANSFERT",
        dateFin: addDays(new Date(), 10),
        dateDebut: subDays(new Date(), 10),
      };

      // Date de dernier passage avant toute modif
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
          structure: user.structure,
          usager,
          user,
        });
      // Après suppression, date de dernier passage doit être la même qu'au début
      expect(usagerAfterDelete.lastInteraction.dateInteraction).toBeDefined();
    });

    it("Distribution d'un courrier avec procuration ", async () => {
      const lastInteractionDateBefore = "2018-02-01T10:00:00.980Z";
      usager.lastInteraction.dateInteraction = new Date(
        lastInteractionDateBefore
      );

      const interaction: InteractionDto = {
        type: "courrierOut",
        content: "Test transfert du courrier",
        nbCourrier: 10,
        procurationIndex: 0,
        structureId: 1,
        userId: 1,
        usagerRef: usager.ref,
        userName: "Nom",
        dateInteraction: new Date(),
      };

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
        structure: user.structure,
        usager,
        user,
      });

      const diffHours = differenceInHours(
        new Date(),
        resultat.interaction.dateInteraction
      );

      expect(diffHours).toEqual(0);
    });
  });

  describe("4. Tests des timezones", () => {
    it("Récupération d'un courrier en Guyanne (-4 heures)", async () => {
      user = await userStructureRepository.findOne({ id: 11 });
      user.structure = await structureRepository.findOneBy({ id: 5 });
      usager = await usagerRepository.findOneBy({
        ref: 1,
        structureId: user.structure.id,
      });

      const interactionIn: InteractionDto = {
        type: "courrierIn",
        content: "Ceci est une liste de courriers",
        nbCourrier: 10, // Déja 80 courriers présents
        dateInteraction: new Date(),
      };

      const createdInteractionIn = await interactionsCreator.createInteraction({
        usager,
        user,
        interaction: interactionIn,
      });

      expect(createdInteractionIn.usager.prenom).toEqual("Henri");
      expect(createdInteractionIn.usager.lastInteraction.courrierIn).toEqual(
        10
      );
      expect(createdInteractionIn.usager.lastInteraction.colisIn).toEqual(0);
      expect(createdInteractionIn.usager.lastInteraction.recommandeIn).toEqual(
        0
      );
      expect(createdInteractionIn.usager.lastInteraction.recommandeIn).toEqual(
        0
      );

      //
      //
      // Partie 2 : test de la distribution
      const interactionOut: InteractionDto = {
        type: "courrierOut",
        content: "Retrait du courrier",
        nbCourrier: 191110, // On test un faux nombre de courrier sortants
      };

      const resultat = await interactionsCreator.createInteraction({
        usager,
        user,
        interaction: interactionOut,
      });

      expect(resultat.usager.lastInteraction.courrierIn).toEqual(0);

      // clean
      await interactionsDeletor.deleteOrRestoreInteraction({
        interaction: createdInteractionIn.interaction,
        structure: user.structure,
        usager,
        user,
      });
      // clean
      await interactionsDeletor.deleteOrRestoreInteraction({
        interaction: resultat.interaction,
        structure: user.structure,
        usager,
        user,
      });
    });
  });
});
