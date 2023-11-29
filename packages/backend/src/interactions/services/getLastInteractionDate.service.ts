import { differenceInCalendarDays } from "date-fns";
import {
  INTERACTION_OK_LIST,
  Interactions,
  Structure,
  Usager,
} from "../../_common/model";

import {
  interactionRepository,
  userUsagerLoginRepository,
} from "../../database";
export const getLastInteractionOut = async (
  usager: Usager,
  structure: Pick<Structure, "id" | "sms" | "telephone" | "portailUsager">,
  interaction?: Interactions
) => {
  let dateInteraction = await getDateFromInteraction(usager, interaction);
  dateInteraction = await getDateFromUserLogin(
    usager,
    structure,
    dateInteraction
  );

  return shouldReturnDateInteraction(usager, dateInteraction)
    ? dateInteraction
    : usager.decision.dateDebut;
};

const getDateFromInteraction = async (
  usager: Usager,
  interaction: Interactions
): Promise<Date | null> => {
  if (
    (interaction && INTERACTION_OK_LIST.includes(interaction.type)) ||
    !interaction
  ) {
    const lastInteractionOut =
      await interactionRepository.getLastInteractionOut(usager);
    return lastInteractionOut ? lastInteractionOut.dateInteraction : null;
  }
  return null;
};

const getDateFromUserLogin = async (
  usager: Usager,
  structure: Pick<Structure, "id" | "sms" | "telephone" | "portailUsager">,
  dateInteraction: Date | null
): Promise<Date | null> => {
  if (
    structure.portailUsager.usagerLoginUpdateLastInteraction &&
    usager.options.portailUsagerEnabled
  ) {
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

const shouldReturnDateInteraction = (
  usager: Usager,
  dateInteraction: Date | null
): boolean => {
  return (
    dateInteraction &&
    differenceInCalendarDays(
      dateInteraction,
      new Date(usager.decision.dateDebut)
    ) > 0
  );
};
