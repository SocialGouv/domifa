import { differenceInCalendarDays } from "date-fns";
import { INTERACTION_OK_LIST, Structure, Usager } from "../../_common/model";

import {
  interactionRepository,
  userUsagerLoginRepository,
} from "../../database";
import { CommonInteraction } from "@domifa/common";

export const getLastInteractionOut = async (
  usager: Usager,
  structure: Pick<Structure, "id" | "sms" | "telephone" | "portailUsager">,
  interaction?: CommonInteraction
) => {
  let dateInteraction = await getDateFromInteraction(usager, interaction);

  dateInteraction = await getDateFromUserLogin(
    usager,
    structure,
    dateInteraction
  );

  return getMostRecentInteractionDate(usager, dateInteraction);
};

export const getDateFromInteraction = async (
  usager: Usager,
  interaction?: CommonInteraction
): Promise<Date | null> => {
  if (
    (interaction && INTERACTION_OK_LIST.includes(interaction.type)) ||
    !interaction
  ) {
    const lastInteractionOut =
      await interactionRepository.findLastInteractionOut(usager);
    return lastInteractionOut ? lastInteractionOut.dateInteraction : null;
  }

  return null;
};

export const getDateFromUserLogin = async (
  usager: Usager,
  structure: Pick<Structure, "id" | "portailUsager">,
  dateInteraction: Date | null
): Promise<Date | null> => {
  if (structure.portailUsager.usagerLoginUpdateLastInteraction) {
    const lastUserUsagerLogin = await userUsagerLoginRepository.findOne({
      where: { usagerUUID: usager.uuid },
      select: { createdAt: true },
      order: { createdAt: "DESC" },
    });

    if (lastUserUsagerLogin?.createdAt) {
      if (
        !dateInteraction ||
        differenceInCalendarDays(
          lastUserUsagerLogin.createdAt,
          dateInteraction
        ) > 0
      ) {
        return lastUserUsagerLogin.createdAt;
      }
    }
  }
  return dateInteraction;
};

export const getMostRecentInteractionDate = (
  usager: Usager,
  dateInteraction: Date | null
): Date => {
  const dateDebut = new Date(usager.decision.dateDebut);

  // Si la date d'interaction précède la dernière décision, on affecte la date de début de la décision
  if (
    dateInteraction &&
    differenceInCalendarDays(dateInteraction, dateDebut) > 0
  ) {
    return dateInteraction;
  }
  return dateDebut;
};
