import { subDays, addYears } from "date-fns";
import { resetDate } from "./cerfa-utils";
import { generateDateForCerfa } from "./generate-date-for-cerfa.service";
import { CerfaDocType, Usager } from "@domifa/common";

export const getDecisionDate = (
  typeCerfa: CerfaDocType,
  usager: Pick<
    Usager,
    "datePremiereDom" | "decision" | "historique" | "typeDom"
  >
) => {
  let datePremiereDom = generateDateForCerfa(usager.datePremiereDom);
  let dateDebut = generateDateForCerfa(usager.decision.dateDebut);
  let dateFin = generateDateForCerfa(usager.decision.dateFin);

  if (!usager?.datePremiereDom) {
    datePremiereDom = generateDateForCerfa(new Date());
  }

  if (
    (typeCerfa === "attestation" || typeCerfa === "attestation_future") &&
    (usager.decision.statut === "INSTRUCTION" ||
      usager.decision.statut === "ATTENTE_DECISION")
  ) {
    const index =
      usager.decision.statut === "INSTRUCTION"
        ? usager.historique.length - 2
        : usager.historique.length - 3;

    if (
      usager.typeDom === "PREMIERE_DOM" ||
      typeCerfa === "attestation_future"
    ) {
      dateDebut = generateDateForCerfa(new Date());
      dateFin = generateDateForCerfa(subDays(addYears(new Date(), 1), 1));
    } else if (typeof usager.historique[index] !== "undefined") {
      const lastDecision = usager.historique[index];
      dateDebut = generateDateForCerfa(lastDecision.dateDebut);
      dateFin = generateDateForCerfa(lastDecision.dateFin);
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
