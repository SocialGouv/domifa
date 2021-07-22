import { interactionsTypeManager } from ".";
import {
  interactionRepository,
  InteractionsTable,
  usagerLightRepository,
} from "../../database";

import { AppAuthUser, Usager, UsagerLight } from "../../_common/model";
import { Interactions } from "../../_common/model/interaction";
import { InteractionDto } from "../interactions.dto";

export const interactionsCreator = {
  createInteraction,
};
async function createInteraction({
  interaction,
  usager,
  user,
}: {
  interaction: InteractionDto;
  usager: UsagerLight;
  user: Pick<AppAuthUser, "id" | "structureId" | "nom" | "prenom">;
}): Promise<{
  usager: UsagerLight;
  interaction: Interactions;
}> {
  const buildedInteraction = buildNewInteraction({
    interaction,
    usager,
    user,
  });

  const newInteraction = buildedInteraction.newInteraction;
  const lastInteraction = buildedInteraction.usager.lastInteraction;

  const createdInteraction: Interactions = new InteractionsTable(
    newInteraction
  );

  const interactionCreated = await interactionRepository.save(
    createdInteraction
  );

  const usagerUpdated = await usagerLightRepository.updateOne(
    { uuid: usager.uuid },
    { lastInteraction }
  );
  return { usager: usagerUpdated, interaction: interactionCreated };
}

function buildNewInteraction({
  interaction,
  usager,
  user,
}: {
  interaction: InteractionDto;
  usager: Pick<Usager, "ref" | "uuid" | "lastInteraction" | "options">;
  user: Pick<AppAuthUser, "id" | "structureId" | "nom" | "prenom">;
}): {
  usager: Pick<Usager, "lastInteraction">;
  newInteraction: Omit<InteractionsTable, "_id" | "id">;
} {
  const newInteraction = new InteractionsTable(interaction);

  const direction = interactionsTypeManager.getDirection({
    type: interaction.type,
  });

  if (direction === "in") {
    const count =
      typeof interaction.nbCourrier !== "undefined"
        ? interaction.nbCourrier
        : 1;

    usager.lastInteraction[interaction.type] =
      usager.lastInteraction[interaction.type] + count;
    usager.lastInteraction.enAttente = true;
  } else if (direction === "out") {
    // La procuration ne remet pas à jour le dernier passage
    if (interaction.procuration) {
      newInteraction.content =
        "Courrier remis au mandataire : " +
        usager.options.procuration.prenom +
        " " +
        usager.options.procuration.nom.toUpperCase();
    } else {
      usager.lastInteraction.dateInteraction = new Date();
    }

    // Transfert actif: on le précise dans le contenu

    if (usager.options.transfert.actif) {
      if (usager.options.transfert.dateFin >= new Date()) {
        newInteraction.content =
          "Courrier transféré à : " +
          usager.options.transfert.nom +
          " - " +
          usager.options.transfert.adresse.toUpperCase();
      }
    }

    const oppositeType = interactionsTypeManager.getOppositeDirectionalType({
      type: interaction.type,
    });

    newInteraction.nbCourrier = usager.lastInteraction[oppositeType] || 1;

    usager.lastInteraction[oppositeType] = 0;

    usager.lastInteraction.enAttente =
      usager.lastInteraction.courrierIn > 0 ||
      usager.lastInteraction.colisIn > 0 ||
      usager.lastInteraction.recommandeIn > 0;
  } else {
    newInteraction.nbCourrier = 0;
  }

  if (interaction.type === "visite" || interaction.type === "appel") {
    usager.lastInteraction.dateInteraction = new Date();
  }

  newInteraction.structureId = user.structureId;
  newInteraction.usagerRef = usager.ref;
  newInteraction.usagerUUID = usager.uuid;
  newInteraction.userId = user.id;
  newInteraction.userName = user.prenom + " " + user.nom;

  newInteraction.dateInteraction = new Date();

  return { usager, newInteraction };
}
