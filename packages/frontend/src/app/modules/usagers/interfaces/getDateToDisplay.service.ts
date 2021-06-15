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

  return usagerInfos;
};
