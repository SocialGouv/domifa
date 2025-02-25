import { Usager, UsagerEcheanceInfo } from "../interfaces";

export const getEcheanceInfo = (
  usager?: Pick<Usager, "decision" | "historique" | "typeDom">
): UsagerEcheanceInfo => {
  const usagerInfos: UsagerEcheanceInfo = {
    isActif: false,
    dateToDisplay: null,
    dayBeforeEnd: 365,
    color: "d-none",
  };

  if (
    !usager?.decision ||
    (!usager?.decision?.dateDebut &&
      !usager?.decision?.dateFin &&
      !usager?.decision?.dateDecision)
  ) {
    return usagerInfos;
  }

  if (usager.decision.statut === "VALIDE" && usager.decision.dateFin) {
    usagerInfos.isActif = true;
    usagerInfos.dateToDisplay = new Date(usager.decision.dateFin);
  } else if (
    usager.decision.statut === "RADIE" ||
    usager.decision.statut === "REFUS"
  ) {
    usagerInfos.dateToDisplay = usager.decision.dateDebut
      ? new Date(usager.decision.dateDebut)
      : new Date(usager.decision.dateFin as Date);
  } else if (usager.typeDom === "RENOUVELLEMENT") {
    usagerInfos.isActif = true;
    const indexOfDate = usager.decision.statut === "ATTENTE_DECISION" ? 2 : 1;
    if (indexOfDate && usager.historique.length >= indexOfDate) {
      const decisionDate =
        usager.historique[usager.historique.length - indexOfDate]?.dateFin ||
        usager.decision.dateDecision;
      usagerInfos.dateToDisplay = new Date(decisionDate);
    }
  }

  if (usagerInfos.dateToDisplay && !usagerInfos.dateToDisplay.getTime) {
    usagerInfos.dateToDisplay = new Date(usagerInfos.dateToDisplay);
  }

  if (usagerInfos.isActif && usagerInfos.dateToDisplay) {
    const today = new Date();
    const msPerDay: number = 1000 * 60 * 60 * 24;
    const start: number = today.getTime();
    const end: number = usagerInfos.dateToDisplay.getTime();

    const dayBeforeEnd = Math.ceil((end - start) / msPerDay);

    usagerInfos.dayBeforeEnd = dayBeforeEnd;
  }

  if (usagerInfos.dayBeforeEnd < 15) {
    usagerInfos.color = "bg-danger";
  } else if (usagerInfos.dayBeforeEnd < 60) {
    usagerInfos.color = "bg-warning";
  }

  return usagerInfos;
};
