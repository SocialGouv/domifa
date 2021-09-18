import { UsagerEcheanceInfos } from "./../../../../_common/model/usager/UsagerEcheanceInfos.type";
import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";

export const getEcheanceInfos = (
  usager: Partial<UsagerLight>
): UsagerEcheanceInfos => {
  const usagerInfos: UsagerEcheanceInfos = {
    isActif: false,
    dateToDisplay: null,
    dayBeforeEnd: 365,
  };

  if (usager?.decision) {
    usagerInfos.dateToDisplay = new Date(usager.decision.dateDecision);

    if (usager.typeDom === "RENOUVELLEMENT") {
      // En cours de renouvellement
      // En attente de décision de renouvellement
      if (
        usager.decision.statut === "INSTRUCTION" ||
        usager.decision.statut === "ATTENTE_DECISION"
      ) {
        usagerInfos.isActif = true;
      }
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

  return usagerInfos;
};
