import { differenceInCalendarDays } from "date-fns";
import { DecisionDeadline, Usager } from "../interfaces";

export const getDecisionDeadline = (
  usager?: Pick<Usager, "decision" | "historique" | "typeDom">
): DecisionDeadline => {
  const deadline: DecisionDeadline = {
    isActive: false,
    dateToDisplay: null,
    daysBeforeEnd: 365,
    color: null,
  };

  if (
    !usager?.decision ||
    (!usager?.decision?.dateDebut &&
      !usager?.decision?.dateFin &&
      !usager?.decision?.dateDecision)
  ) {
    return deadline;
  }

  if (usager.decision.statut === "VALIDE" && usager.decision.dateFin) {
    deadline.isActive = true;
    deadline.dateToDisplay = new Date(usager.decision.dateFin);
  } else if (
    usager.decision.statut === "RADIE" ||
    usager.decision.statut === "REFUS"
  ) {
    deadline.dateToDisplay = usager.decision.dateDebut
      ? new Date(usager.decision.dateDebut)
      : new Date(usager.decision.dateFin as Date);
  } else if (usager.typeDom === "RENOUVELLEMENT") {
    deadline.isActive = true;
    const indexOfDate = usager.decision.statut === "ATTENTE_DECISION" ? 2 : 1;
    if (indexOfDate && usager.historique.length >= indexOfDate) {
      const decisionDate =
        usager.historique[usager.historique.length - indexOfDate]?.dateFin ||
        usager.decision.dateDecision;
      deadline.dateToDisplay = new Date(decisionDate);
    }
  }

  if (deadline.dateToDisplay && !deadline.dateToDisplay.getTime) {
    deadline.dateToDisplay = new Date(deadline.dateToDisplay);
  }

  if (deadline.isActive && deadline.dateToDisplay) {
    // Day-level comparison: a deadline is only overdue at D+1.
    // If dateToDisplay is today, daysBeforeEnd is 0 (still active, not overdue).
    deadline.daysBeforeEnd = differenceInCalendarDays(
      deadline.dateToDisplay,
      new Date()
    );
  }

  if (deadline.daysBeforeEnd < 16) {
    deadline.color = "bg-danger";
  } else if (deadline.daysBeforeEnd < 61) {
    deadline.color = "bg-warning";
  }

  return deadline;
};
