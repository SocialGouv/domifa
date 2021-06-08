import { UsagerLight } from "../../../../_common/model/usager/UsagerLight.type";

export const getDateToDisplay = (
  usager: Partial<UsagerLight>
): {
  isActif: boolean;
  dateToDisplay: Date;
} => {
  const usagerInfos = {
    isActif: false,
    dateToDisplay: null,
  };

  if (usager && usager?.decision) {
    // En cours de renouvellement
    if (
      usager.decision.statut === "INSTRUCTION" &&
      usager.typeDom === "RENOUVELLEMENT"
    ) {
      usagerInfos.isActif = true;
      usagerInfos.dateToDisplay = new Date(usager.historique[0].dateFin);
    }
    // En attente de décision de renouvellement
    if (
      usager.decision.statut === "ATTENTE_DECISION" &&
      usager.typeDom === "RENOUVELLEMENT"
    ) {
      if (typeof usager.historique[1] !== "undefined") {
        usagerInfos.isActif = true;
        usagerInfos.dateToDisplay = new Date(usager.historique[1].dateFin);
      } else {
        usagerInfos.isActif = true;
        usagerInfos.dateToDisplay = new Date(usager.decision.dateDecision);
      }
    }

    // Actuellement actif
    if (usager.decision.statut === "VALIDE") {
      usagerInfos.dateToDisplay = new Date(usager.decision.dateFin);
      usagerInfos.isActif = true;
    } else if (
      usager.decision.statut === "RADIE" ||
      usager.decision.statut === "REFUS"
    ) {
      usagerInfos.dateToDisplay = usager.decision.dateFin
        ? new Date(usager.decision.dateFin)
        : new Date(usager.decision.dateDebut);
    } else {
      usagerInfos.dateToDisplay = new Date(usager.decision.dateDecision);
    }
  }

  return usagerInfos;
};
