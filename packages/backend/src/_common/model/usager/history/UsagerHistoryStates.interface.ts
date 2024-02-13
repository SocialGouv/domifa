import {
  AppEntity,
  UsagerAyantDroit,
  UsagerDecision,
  UsagerEntretien,
  UsagerRdv,
  UsagerTypeDom,
} from "@domifa/common";

import { UsagerHistoryStateCreationEvent } from "./UsagerHistoryStateCreationEvent.type";

export interface UsagerHistoryStates extends AppEntity {
  usagerUUID: string; // unique
  usagerRef: number; // unique par structure
  structureId: number;

  migrated: boolean;
  etapeDemande: number;
  typeDom: UsagerTypeDom;
  ayantsDroits: Partial<UsagerAyantDroit>[];
  decision: Partial<UsagerDecision>;
  entretien: Partial<UsagerEntretien>;
  rdv: Partial<UsagerRdv>;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate: Date; // début de la période historisée, correspond à l'attribut "historyEndDate" du UsagerHistoryState précédent si il existe (sans rapport avec decision.dateDebut)
  historyEndDate?: Date; // fin de la période historisée, correspond à l'attribut "historyBeginDate" du UsagerHistoryState suivant
  isActive: boolean; // usager actif si VALIDE ou en cours de renouvellement
}
