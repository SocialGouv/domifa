import { differenceInCalendarDays } from "date-fns";
import { PassageDeadline, Usager } from "../interfaces";

export const getPassageDeadline = (
  usager?: Pick<Usager, "decision" | "lastInteraction">
): PassageDeadline => {
  const deadline: PassageDeadline = {
    isActive: false,
    dateToDisplay: null,
    daysSinceLastPassage: 0,
    color: null,
  };

  if (
    usager?.decision?.statut !== "VALIDE" ||
    !usager?.lastInteraction?.dateInteraction
  ) {
    return deadline;
  }

  deadline.isActive = true;
  deadline.dateToDisplay = new Date(usager.lastInteraction.dateInteraction);
  // Day-level comparison aligned with getDecisionDeadline thresholds:
  // 61 days ~ 2 months complete + 1 day, 91 days ~ 3 months complete + 1 day.
  deadline.daysSinceLastPassage = differenceInCalendarDays(
    new Date(),
    deadline.dateToDisplay
  );

  if (deadline.daysSinceLastPassage >= 91) {
    deadline.color = "bg-danger";
  } else if (deadline.daysSinceLastPassage >= 61) {
    deadline.color = "bg-warning";
  }

  return deadline;
};
