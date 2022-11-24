import { differenceInCalendarDays } from "date-fns";
import { interactionsTypeManager } from ".";
import {
  interactionRepository,
  InteractionsTable,
  usagerLightRepository,
} from "../../database";
import {
  Interactions,
  Structure,
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
      interaction.procurationIndex !== null &&
      typeof interaction.procurationIndex !== "undefined"
    ) {
      interaction.content =
        interaction.content +
        "\nCourrier remis au mandataire : " +
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
          "\nCourrier transféré à : " +
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
  if (
    interaction.type === "appel" ||
    interaction.type === "visite" ||
    interaction.type === "npai"
  ) {
    usager.lastInteraction.dateInteraction = now;
    interaction.nbCourrier = 0;
  }

  // Connexion au portail
  if (interaction.type === "loginPortail") {
    if (user.structure.portailUsager.usagerLoginUpdateLastInteraction) {
      usager.lastInteraction.dateInteraction = now;
    }
    interaction.nbCourrier = 0;
  }

  delete interaction.procurationIndex;
  if (interaction.content) {
    interaction.content = interaction.content.trim();
  }

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
    structure: user.structure,
  });

  return { usager: usagerUpdated, interaction: interactionCreated };
}

async function updateUsagerAfterCreation({
  usager,
  structure,
}: {
  structure: Pick<Structure, "portailUsager">;
  usager: Pick<Usager, "uuid" | "lastInteraction">;
}): Promise<UsagerLight> {
  const lastInteraction = usager.lastInteraction;

  const lastInteractionCount =
    await interactionRepository.countPendingInteractionsIn({
      usagerUUID: usager.uuid,
      structure,
    });

  const lastDateFromInteractions: Date | null =
    lastInteractionCount.lastInteractionOut;

  if (lastDateFromInteractions) {
    if (!lastInteraction.dateInteraction) {
      lastInteraction.dateInteraction = lastDateFromInteractions;
    } else {
      const lastDate = usager.lastInteraction.dateInteraction;

      if (differenceInCalendarDays(lastDateFromInteractions, lastDate) > 0) {
        lastInteraction.dateInteraction = lastDateFromInteractions;
      }
    }
  }

  lastInteraction.courrierIn = lastInteractionCount.courrierIn;
  lastInteraction.colisIn = lastInteractionCount.colisIn;
  lastInteraction.recommandeIn = lastInteractionCount.recommandeIn;

  lastInteraction.enAttente =
    lastInteraction.courrierIn > 0 ||
    lastInteraction.colisIn > 0 ||
    lastInteraction.recommandeIn > 0;

  console.log("RETOUR START");
  const retour = await usagerLightRepository.updateOne(
    { uuid: usager.uuid },
    { updatedAt: new Date(), lastInteraction }
  );
  console.log("RETOUR END");
  console.log(retour);
  return retour;
}
