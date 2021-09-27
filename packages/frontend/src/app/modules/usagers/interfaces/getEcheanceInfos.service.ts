import { UsagerEcheanceInfos } from "./../../../../_common/model/usager/UsagerEcheanceInfos.type";
import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";

export const getEcheanceInfos = (
  usager: Partial<UsagerLight>
): UsagerEcheanceInfos => {
  const usagerInfos: UsagerEcheanceInfos = {
    isActif: false,
    dateToDisplay: null,
    dayBeforeEnd: 365,
    color: "d-none",
  };

  if (typeof usager.decision === "undefined") {
    return usagerInfos;
  }

  // Actuellement actif
  if (usager.decision.statut === "VALIDE") {
    usagerInfos.isActif = true;
    usagerInfos.dateToDisplay = new Date(usager.decision.dateFin);
  } else if (
    usager.decision.statut === "RADIE" ||
    usager.decision.statut === "REFUS"
  ) {
    usagerInfos.dateToDisplay = usager.decision.dateFin
      ? new Date(usager.decision.dateFin)
      : new Date(usager.decision.dateDebut);
  } else {
    if (usager.typeDom === "RENOUVELLEMENT") {
      usagerInfos.isActif = true;

      const indexOfDate =
        usager.decision.statut === "ATTENTE_DECISION"
          ? 2
          : usager.decision.statut === "INSTRUCTION"
          ? 1
          : null;

      // Fix: certaines donnnées corompus n'ont pas de dateFinn
      usagerInfos.dateToDisplay =
        usager.historique[usager.historique.length - indexOfDate]?.dateFin ??
        usager.decision.dateDecision;
    } else {
      usagerInfos.isActif = false;
      usagerInfos.dateToDisplay = usager.decision.dateDecision;
    }
  }

  if (usagerInfos.isActif) {
    const today = new Date();
    const msPerDay: number = 1000 * 60 * 60 * 24;
    const start: number = today.getTime();
    const end: number = usagerInfos.dateToDisplay.getTime();

    const dayBeforeEnd = Math.ceil((end - start) / msPerDay);

    usagerInfos.dayBeforeEnd = dayBeforeEnd;
  }

  if (usagerInfos.dayBeforeEnd < 15) {
    usagerInfos.color = "bg-danger";
  } else if (usagerInfos.dayBeforeEnd > 15 && usagerInfos.dayBeforeEnd < 60) {
    usagerInfos.color = "bg-warning";
  }

  return usagerInfos;
};
