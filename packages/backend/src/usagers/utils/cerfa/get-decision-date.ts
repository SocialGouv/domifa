import { subDays, addYears } from "date-fns";
import { getDateForCerfa, resetDate } from "./get-date-for-cerfa";
import { CerfaDocType, Usager } from "@domifa/common";

export const getDecisionDate = (
  typeCerfa: CerfaDocType,
  usager: Pick<
    Usager,
    "datePremiereDom" | "decision" | "historique" | "typeDom"
  >
) => {
  let datePremiereDom = getDateForCerfa(usager.datePremiereDom);
  let dateDebut = getDateForCerfa(usager.decision.dateDebut);
  let dateFin = getDateForCerfa(usager.decision.dateFin);

  if (!usager?.datePremiereDom) {
    datePremiereDom = getDateForCerfa(new Date());
  }

  if (
    (typeCerfa === CerfaDocType.attestation ||
      typeCerfa === CerfaDocType.attestation_future) &&
    (usager.decision.statut === "INSTRUCTION" ||
      usager.decision.statut === "ATTENTE_DECISION")
  ) {
    const index =
      usager.decision.statut === "INSTRUCTION"
        ? usager.historique.length - 2
        : usager.historique.length - 3;

    if (
      usager.typeDom === "PREMIERE_DOM" ||
      typeCerfa === CerfaDocType.attestation_future
    ) {
      dateDebut = getDateForCerfa(new Date());
      dateFin = getDateForCerfa(subDays(addYears(new Date(), 1), 1));
    } else if (typeof usager.historique[index] !== "undefined") {
      const lastDecision = usager.historique[index];
      dateDebut = getDateForCerfa(lastDecision.dateDebut);
      dateFin = getDateForCerfa(lastDecision.dateFin);
    } else {
      dateDebut = resetDate();
      dateFin = resetDate();
    }
  }

  return {
    datePremiereDom,
    dateDebut,
    dateFin,
  };
};
