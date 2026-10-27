import { Usager, UsagerDecision } from "@domifa/common";

// getDecisionDeadline needs every entry (length and previous one): keep them all, trim the fields only
export const filterUsagerHistorique = <T extends Pick<Usager, "historique">>(
  usager: T
): T => {
  if (usager.historique && Array.isArray(usager.historique)) {
    usager.historique = usager.historique.map((item: UsagerDecision) => ({
      statut: item.statut,
      dateDecision: item.dateDecision,
      dateDebut: item.dateDebut,
      dateFin: item.dateFin,
    })) as UsagerDecision[];
  }
  return usager;
};
