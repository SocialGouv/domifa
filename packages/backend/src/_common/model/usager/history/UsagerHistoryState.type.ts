import {
  UsagerDecision,
  UsagerEntretien,
  UsagerAyantDroit,
  UsagerRdv,
  Usager,
} from "@domifa/common";
import { UsagerHistoryStateCreationEvent } from "./UsagerHistoryStateCreationEvent.type";

// état d'un usager pendant une période, change à chaque modification (décision, entretien, ayants droit)
// les UsagerHistoryState ne se chevauchent pas, mais se succèdent
export type UsagerHistoryState = Pick<Usager, "etapeDemande" | "typeDom"> & {
  ayantsDroits: Partial<UsagerAyantDroit>[];
  decision: Partial<UsagerDecision>;
  entretien: Partial<UsagerEntretien>;
  rdv: Partial<UsagerRdv>;
  uuid: string;
  createdAt: Date;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate: Date; // début de la période historisée, correspond à l'attribut "historyEndDate" du UsagerHistoryState précédent si il existe (sans rapport avec decision.dateDebut)
  historyEndDate?: Date; // fin de la période historisée, correspond à l'attribut "historyBeginDate" du UsagerHistoryState suivant
  isActive: boolean; // usager actif si VALIDE ou en cours de renouvellement
};
