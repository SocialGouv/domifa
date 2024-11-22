import { differenceInCalendarDays, max } from "date-fns";

import {
  interactionRepository,
  userUsagerLoginRepository,
} from "../../../database";
import { Structure, Usager } from "@domifa/common";

export const getLastInteractionOut = async (
  usager: Usager,
  structure: Pick<Structure, "id" | "sms" | "telephone" | "portailUsager">
) => {
  const lastInteractionOut = await interactionRepository.findLastInteractionOut(
    usager
  );

  let dateInteraction = lastInteractionOut?.dateInteraction
    ? new Date(lastInteractionOut?.dateInteraction)
    : null;

  dateInteraction = await getDateFromUserLogin(
    usager,
    structure,
    dateInteraction
  );

  return getMostRecentInteractionDate(usager, dateInteraction);
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

    if (lastUserUsagerLogin?.createdAt && dateInteraction) {
      return max([new Date(lastUserUsagerLogin.createdAt), dateInteraction]);
    }
    if (lastUserUsagerLogin?.createdAt) {
      return new Date(lastUserUsagerLogin.createdAt);
    }
  }
  return dateInteraction;
};

export const getMostRecentInteractionDate = (
  usager: Usager,
  dateInteraction: Date
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
