import { AppUserResume } from "../../app-user/AppUserResume.type";
import { Usager } from "../Usager.type";
import { UsagerHistoryStateCreationEvent } from "./UsagerHistoryStateCreationEvent.type";

// état d'un usager pendant une période, change à chaque modification (décision, entretien, ayants droits)
// les UsagerHistoryState ne se chevauchent pas, mais se succèdent
export type UsagerHistoryState = Pick<
  Usager,
  "decision" | "entretien" | "ayantsDroits" | "etapeDemande" | "rdv" | "typeDom"
> & {
  uuid: string;
  createdAt: Date;
  createdBy: AppUserResume;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate: Date; // début de la période historisée, correspond à l'attribut "historyEndDate" du UsagerHistoryState précédent si il existe (sans rapport avec decision.dateDebut)
  historyEndDate?: Date; // fin de la période historisée, correspond à l'attribut "historyBeginDate" du UsagerHistoryState suivant
  isActive: boolean; // usager actif si VALIDE ou en cours de renouvellement
};
