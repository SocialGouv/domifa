import { addDays, addMonths, differenceInCalendarDays } from "date-fns";
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

  // A deadline is reached once the delay is fully elapsed, at D+1 (e.g. 2 months complete + 1 day).
  const twoMonthsDeadline = addDays(addMonths(deadline.dateToDisplay, 2), 1);
  const threeMonthsDeadline = addDays(addMonths(deadline.dateToDisplay, 3), 1);

  if (differenceInCalendarDays(new Date(), threeMonthsDeadline) >= 0) {
    deadline.color = "bg-danger";
  } else if (differenceInCalendarDays(new Date(), twoMonthsDeadline) >= 0) {
    deadline.color = "bg-warning";
  }

  return deadline;
};
