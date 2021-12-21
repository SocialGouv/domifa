import { interactionsTypeManager } from ".";
import {
  interactionRepository,
  InteractionsTable,
  typeOrmSearch,
  usagerLightRepository,
} from "../../database";
import {
  Interactions,
  Usager,
  UsagerLight,
  UserStructureAuthenticated,
} from "../../_common/model";
import { InteractionDto } from "../dto";

export const interactionsCreator = {
  createInteraction,
  updateUsagerAfterCreation,
};

async function createInteraction({
  interaction,
  usager,
  user,
}: {
  interaction: InteractionDto;
  usager: UsagerLight;
  user: Pick<
    UserStructureAuthenticated,
    "id" | "structureId" | "nom" | "prenom"
  >;
}): Promise<{
  usager: UsagerLight;
  interaction: Interactions;
}> {
  const buildedInteraction = await buildNewInteraction({
    interaction,
    usager,
    user,
  });

  const newInteraction = buildedInteraction.newInteraction;

  const interactionCreated = await interactionRepository.save(
    new InteractionsTable(newInteraction)
  );

  // S'il s'agit d'une distribution, on met à jour toutes les interactions entrantes correspondant
  if (
    interactionsTypeManager.getDirection({
      type: interaction.type,
    }) === "out"
  ) {
    await updateInteractionAfterDistribution(interactionCreated);
  }

  const usagerUpdated = await updateUsagerAfterCreation({
    usager: buildedInteraction.usager,
    user,
  });

  return { usager: usagerUpdated, interaction: interactionCreated };
}

async function buildNewInteraction({
  interaction,
  usager,
  user,
}: {
  interaction: InteractionDto;
  usager: Pick<Usager, "ref" | "uuid" | "lastInteraction" | "options">;
  user: Pick<
    UserStructureAuthenticated,
    "id" | "structureId" | "nom" | "prenom"
  >;
}): Promise<{
  usager: Pick<Usager, "ref" | "uuid" | "lastInteraction" | "options">;
  newInteraction: Interactions;
}> {
  interaction.dateInteraction = new Date();

  const direction = interactionsTypeManager.getDirection({
    type: interaction.type,
  });

  if (direction === "in") {
    if (typeof interaction.nbCourrier === "undefined") {
      interaction.nbCourrier = 1;
    }
  } else if (direction === "out") {
    const oppositeType = interactionsTypeManager.getOppositeDirectionalType({
      type: interaction.type,
    });

    // On ajoute le dernier contenu
    const lastInteraction =
      await interactionRepository.findLastInteractionInWithContent({
        user,
        usager,
        oppositeType,
      });

    interaction.content = lastInteraction?.content || "";

    // La procuration ne remet pas à jour le dernier passage
    if (interaction.procuration) {
      interaction.content =
        "Courrier remis au mandataire : " +
        usager.options.procuration.prenom +
        " " +
        usager.options.procuration.nom.toUpperCase();
    } else {
      usager.lastInteraction.dateInteraction = new Date();
    }

    // Transfert actif: on le précise dans le contenu
    if (usager.options.transfert.actif) {
      if (new Date(usager.options.transfert.dateFin) >= new Date()) {
        interaction.content =
          "Courrier transféré à : " +
          usager.options.transfert.nom +
          " - " +
          usager.options.transfert.adresse.toUpperCase();
      }
    }

    const pendingInteractionsCount =
      await interactionRepository.countPendingInteraction({
        structureId: user.structureId,
        usagerRef: usager.ref,
        interactionType: oppositeType,
      });

    interaction.nbCourrier = pendingInteractionsCount;
  } else {
    if (interaction.type === "visite" || interaction.type === "appel") {
      usager.lastInteraction.dateInteraction = new Date();
    }
    interaction.nbCourrier = 0;
  }

  delete interaction.procuration;

  const newInteraction: Interactions = {
    ...interaction,
    structureId: user.structureId,
    usagerRef: usager.ref,
    usagerUUID: usager.uuid,
    userId: user.id,
    userName: user.prenom + " " + user.nom,
    dateInteraction: new Date(),
    event: "create",
  };

  return { usager, newInteraction };
}

async function updateInteractionAfterDistribution(interaction: Interactions) {
  const oppositeType = interactionsTypeManager.getOppositeDirectionalType({
    type: interaction.type,
  });

  // Liste des interactions entrantes à mettre à jour
  const updatedInteractions = await interactionRepository.updateMany(
    typeOrmSearch<InteractionsTable>({
      usagerRef: interaction.usagerRef,
      structureId: interaction.structureId,
      type: oppositeType,
      interactionOutUUID: null,
      event: "create",
    }),
    { interactionOutUUID: interaction.uuid }
  );

  return updatedInteractions;
}

async function updateUsagerAfterCreation({
  usager,
  user,
}: {
  usager: Pick<Usager, "ref" | "uuid" | "lastInteraction">;
  user: Pick<
    UserStructureAuthenticated,
    "id" | "structureId" | "nom" | "prenom"
  >;
}): Promise<UsagerLight> {
  const lastInteractionCount =
    await interactionRepository.countPendingInteractionsIn({
      structureId: user.structureId,
      usagerRef: usager.ref,
    });

  usager.lastInteraction.courrierIn = lastInteractionCount.courrierIn;
  usager.lastInteraction.colisIn = lastInteractionCount.colisIn;
  usager.lastInteraction.recommandeIn = lastInteractionCount.recommandeIn;

  usager.lastInteraction.enAttente =
    usager.lastInteraction.courrierIn > 0 ||
    usager.lastInteraction.colisIn > 0 ||
    usager.lastInteraction.recommandeIn > 0;

  return await usagerLightRepository.updateOne(
    { uuid: usager.uuid },
    { lastInteraction: usager.lastInteraction }
  );
}
