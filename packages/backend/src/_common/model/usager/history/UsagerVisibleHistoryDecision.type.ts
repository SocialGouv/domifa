import { UsagerDecision } from "../UsagerDecision.type";
import { UsagerVisibleHistoryDecisionStatut } from "./UsagerVisibleHistoryDecisionStatut.type";

export type UsagerVisibleHistoryDecision = Omit<UsagerDecision, "statut"> & {
  statut: UsagerVisibleHistoryDecisionStatut;
};
