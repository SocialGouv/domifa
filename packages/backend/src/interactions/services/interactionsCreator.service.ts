import {
  interactionRepository,
  InteractionsTable,
  usagerRepository,
} from "../../database";
import { Usager, UserStructure } from "../../_common/model";
import { InteractionDto } from "../dto";
import { interactionsTypeManager } from "./interactionsTypeManager.service";
import { CommonInteraction } from "@domifa/common";

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
  usager: Usager;
  user: Pick<
    UserStructure,
    "id" | "structureId" | "nom" | "prenom" | "structure"
  >;
}): Promise<{
  usager: Usager;
  interaction: CommonInteraction;
}> {
  const now = new Date();
  let procuration: boolean | null = null;
  const direction = interactionsTypeManager.getDirection({
    type: interaction.type,
  });
  const oppositeType = interactionsTypeManager.getOppositeDirectionalType({
    type: interaction.type,
  });

  // Interactions sortantes
  if (direction === "out") {
    // On ajoute le dernier contenu
    const lastInteraction =
      await interactionRepository.findLastInteractionInWithContent({
        user,
        usager,
        oppositeType,
      });

    const pendingInteractionsCount =
      await interactionRepository.countPendingInteraction({
        structureId: user.structureId,
        usagerUUID: usager.uuid,
        interactionType: oppositeType,
      });

    interaction.nbCourrier = pendingInteractionsCount;
    interaction.content = lastInteraction?.content ?? "";

    // Note métier :
    // La date de dernier passage n'est pas mise à jour si remise à un mandataire
    if (typeof interaction.procurationIndex === "number") {
      interaction.content = `${
        interaction.content
      }\nCourrier remis au mandataire : ${
        usager.options.procurations[interaction.procurationIndex].prenom
      } ${usager.options.procurations[
        interaction.procurationIndex
      ].nom.toUpperCase()}`;
      procuration = true;
    } else if (interaction.returnToSender === true) {
      // Retour à l'expéditeur
      interaction.content = `Courrier retourné à l'expéditeur\n${interaction.content}`;
    } else if (
      usager.options.transfert.actif &&
      new Date(usager.options.transfert.dateFin) >= now
    ) {
      usager.lastInteraction.dateInteraction = now;
      interaction.content += `\nCourrier transféré à : ${
        usager.options.transfert.nom
      } - ${usager.options.transfert.adresse.toUpperCase()}`;
    } else {
      usager.lastInteraction.dateInteraction = now;
    }
  } else if (direction === "in") {
    interaction.nbCourrier = interaction.nbCourrier ?? 1;
  } else {
    interaction.nbCourrier = 0;
    if (interaction.type === "appel" || interaction.type === "visite") {
      usager.lastInteraction.dateInteraction = now;
    }
  }

  interaction.content = interaction.content?.trim();

  const newInteraction: CommonInteraction = {
    ...interaction,
    structureId: user.structureId,
    usagerRef: usager.ref,
    usagerUUID: usager.uuid,
    userId: user.id,
    userName: `${user.prenom} ${user.nom}`,
    dateInteraction: now,
    interactionOutUUID: null,
    procuration,
  };

  const interactionCreated = await interactionRepository.save(
    new InteractionsTable(newInteraction)
  );

  // S'il s'agit d'une distribution, on met à jour toutes les interactions entrantes correspondant
  if (direction === "out") {
    await interactionRepository.updateInteractionAfterDistribution(
      usager,
      interactionCreated,
      oppositeType
    );
  }

  // Mise à jour des infos de dernier passage pour l'usager
  const usagerUpdated = await updateUsagerAfterCreation({
    usager,
  });

  return { usager: usagerUpdated, interaction: interactionCreated };
}

async function updateUsagerAfterCreation({
  usager,
}: {
  usager: Pick<Usager, "uuid" | "lastInteraction" | "decision" | "options">;
}): Promise<Usager> {
  const pendingInteractionsIn =
    await interactionRepository.countPendingInteractionsIn({
      usager,
    });

  return usagerRepository.updateOneAndReturn(usager.uuid, {
    updatedAt: new Date(),
    lastInteraction: {
      ...usager.lastInteraction,
      courrierIn: pendingInteractionsIn.courrierIn,
      colisIn: pendingInteractionsIn.colisIn,
      recommandeIn: pendingInteractionsIn.recommandeIn,
      enAttente:
        pendingInteractionsIn.courrierIn > 0 ||
        pendingInteractionsIn.colisIn > 0 ||
        pendingInteractionsIn.recommandeIn > 0,
    },
  });
}
