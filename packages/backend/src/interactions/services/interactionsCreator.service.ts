import { interactionsTypeManager } from ".";
import {
  interactionRepository,
  InteractionsTable,
  usagerLightRepository,
} from "../../database";
import {
  Interactions,
  Usager,
  UsagerLight,
  UserStructure,
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
    UserStructure,
    "id" | "structureId" | "nom" | "prenom" | "structure"
  >;
}): Promise<{
  usager: UsagerLight;
  interaction: Interactions;
}> {
  const now = new Date();

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
        usagerRef: usager.ref,
        interactionType: oppositeType,
      });

    interaction.nbCourrier = pendingInteractionsCount;
    interaction.content = lastInteraction?.content || "";

    // Note métier :
    // La date de dernier passage n'est pas mise à jour si remise à un mandataire
    if (
      interaction.procurationIndex === 0 ||
      interaction.procurationIndex === 1
    ) {
      interaction.content =
        interaction.content +
        "Courrier remis au mandataire : " +
        usager.options.procurations[interaction.procurationIndex].prenom +
        " " +
        usager.options.procurations[
          interaction.procurationIndex
        ].nom.toUpperCase();
    } else {
      usager.lastInteraction.dateInteraction = now;
    }

    // Transfert actif: on le précise dans le contenu
    if (usager.options.transfert.actif) {
      if (new Date(usager.options.transfert.dateFin) >= now) {
        interaction.content =
          interaction.content +
          "Courrier transféré à : " +
          usager.options.transfert.nom +
          " - " +
          usager.options.transfert.adresse.toUpperCase();
      }
    }
  }

  // Entrants
  if (direction === "in") {
    if (typeof interaction.nbCourrier === "undefined") {
      interaction.nbCourrier = 1;
    }
  }

  // Appels & Visites
  if (interaction.type === "appel" || interaction.type === "visite") {
    usager.lastInteraction.dateInteraction = now;
    interaction.nbCourrier = 0;
  }

  delete interaction.procurationIndex;

  const newInteraction: Interactions = {
    ...interaction,
    structureId: user.structureId,
    usagerRef: usager.ref,
    usagerUUID: usager.uuid,
    userId: user.id,
    userName: user.prenom + " " + user.nom,
    dateInteraction: now,
    interactionOutUUID: null,
    event: "create",
  };

  // Enregistrement de l'interaction
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
  usager: Pick<Usager, "ref" | "uuid" | "lastInteraction">;
}): Promise<UsagerLight> {
  const lastInteractionCount =
    await interactionRepository.countPendingInteractionsIn({
      usagerUUID: usager.uuid,
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
