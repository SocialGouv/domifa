import { subDays, addYears } from "date-fns";
import { getDateForCerfa, resetDate } from "./get-date-for-cerfa";
import { CerfaDocType, Usager, UsagerDecision } from "@domifa/common";
import { DateCerfa } from "../../constants/cerfa";

export const getDecisionDate = (
  typeCerfa: CerfaDocType,
  usager: Pick<
    Usager,
    | "datePremiereDom"
    | "dateDerniereDom"
    | "decision"
    | "historique"
    | "typeDom"
  >,
  decision: UsagerDecision
): {
  datePremiereDom: DateCerfa;
  dateDebut: DateCerfa;
  dateFin: DateCerfa;
} => {
  // La date affichée comme "première domiciliation" sur le Cerfa doit
  // correspondre au début de la domiciliation en cours et ininterrompue
  // (dateDerniereDom), et non à la toute première domiciliation historique
  // dans la structure si celle-ci a été interrompue par une radiation.
  const dateReferencePremiereDom =
    usager.dateDerniereDom ?? usager.datePremiereDom;

  let datePremiereDom = getDateForCerfa(dateReferencePremiereDom);
  let dateDebut = getDateForCerfa(decision.dateDebut);
  let dateFin = getDateForCerfa(decision.dateFin);

  if (!dateReferencePremiereDom) {
    datePremiereDom = getDateForCerfa(new Date());
  }

  if (
    (typeCerfa === CerfaDocType.attestation ||
      typeCerfa === CerfaDocType.attestation_future) &&
    (decision.statut === "INSTRUCTION" ||
      decision.statut === "ATTENTE_DECISION")
  ) {
    const index =
      decision.statut === "INSTRUCTION"
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
