import { interactionsTypeManager } from ".";
import {
  interactionRepository,
  InteractionsTable,
  usagerLightRepository,
} from "../../database";
import {
  Usager,
  UsagerLight,
  UserStructureAuthenticated,
} from "../../_common/model";
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
  const lastInteraction = buildedInteraction.usager.lastInteraction;

  const news = new InteractionsTable(newInteraction);
  const interactionCreated = await interactionRepository.save(news);

  const usagerUpdated = await usagerLightRepository.updateOne(
    { uuid: usager.uuid },
    { lastInteraction }
  );
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
  usager: Pick<Usager, "lastInteraction">;
  newInteraction: Interactions;
}> {
  interaction.dateInteraction = new Date();

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

    interaction.nbCourrier = usager.lastInteraction[oppositeType] || 1;

    usager.lastInteraction[oppositeType] = 0;

    usager.lastInteraction.enAttente =
      usager.lastInteraction.courrierIn > 0 ||
      usager.lastInteraction.colisIn > 0 ||
      usager.lastInteraction.recommandeIn > 0;
  } else {
    interaction.nbCourrier = 0;
  }

  if (interaction.type === "visite" || interaction.type === "appel") {
    usager.lastInteraction.dateInteraction = new Date();
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
