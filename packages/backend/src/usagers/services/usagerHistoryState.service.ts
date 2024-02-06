import { UsagerHistoryStates } from "./../../_common/model/usager/history/UsagerHistoryStates.interface";
import { UsagerDecision, UsagerEntretien } from "@domifa/common";
import { Injectable } from "@nestjs/common";
import { Usager, UsagerHistoryStateCreationEvent } from "../../_common/model";
import {
  getDecisionForStats,
  getEntretienForStats,
  getAyantsDroitForStats,
} from "./dataCleanerForStats.service";
import { UsagerHistoryStatesTable } from "../../database/entities/usager/UsagerHistoryStatesTable.typeorm";
import { getHistoryBeginDate } from ".";

@Injectable()
export class UsagerHistoryStateService {
  create() {}

  buildState({
    usager,
    createdAt,
    createdEvent,
    historyBeginDate,
    previousState,
  }: {
    usager: Usager;
    createdAt: Date;
    createdEvent: UsagerHistoryStateCreationEvent;
    historyBeginDate: Date;
    previousState: UsagerHistoryStates;
  }) {
    const decision: Partial<UsagerDecision> = getDecisionForStats(
      usager.decision
    );

    const entretien: Partial<UsagerEntretien> = getEntretienForStats(
      usager.entretien
    );

    const isActive =
      decision.statut === "VALIDE" ||
      ((decision.statut === "ATTENTE_DECISION" ||
        decision.statut === "INSTRUCTION") &&
        (previousState?.isActive ?? false));

    const ayantsDroits = getAyantsDroitForStats(usager?.ayantsDroits);

    let typeDom = usager?.typeDom ?? usager?.decision?.typeDom;

    if (!typeDom) {
      typeDom = "PREMIERE_DOM";
    }

    const state: UsagerHistoryStates = {
      usagerRef: usager.ref,
      usagerUUID: usager.uuid,
      structureId: usager.structureId,
      createdAt,
      createdEvent,
      isActive,
      historyBeginDate: getHistoryBeginDate(historyBeginDate ?? createdAt),
      historyEndDate: undefined,
      decision,
      typeDom,
      etapeDemande: usager.etapeDemande,
      entretien,
      ayantsDroits,
      rdv: { dateRdv: usager?.rdv?.dateRdv },
      migrated: false,
    };

    // Update previous states

    return new UsagerHistoryStatesTable(state);
  }
}
