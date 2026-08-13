import {
  differenceInCalendarDays,
  endOfDay,
  subDays,
  subMonths,
} from "date-fns";
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
  deadline.daysSinceLastPassage = differenceInCalendarDays(
    new Date(),
    deadline.dateToDisplay
  );

  // Same deadlines as the "dernier passage" filter on the manage page (getUsagerDeadlines).
  const now = new Date();
  const previousTwoMonths = subDays(endOfDay(subMonths(now, 2)), 1);
  const previousThreeMonths = subDays(endOfDay(subMonths(now, 3)), 1);

  if (deadline.dateToDisplay < previousThreeMonths) {
    deadline.color = "bg-danger";
  } else if (deadline.dateToDisplay < previousTwoMonths) {
    deadline.color = "bg-warning";
  }

  return deadline;
};
