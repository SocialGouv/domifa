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
import { usagerHistoryStatesRepository } from "../../database";
import { IsNull } from "typeorm";

@Injectable()
export class UsagerHistoryStateService {
  async deleteHistoryState(usager: Pick<Usager, "uuid">): Promise<void> {
    // Delete last entry
    await usagerHistoryStatesRepository.delete({
      usagerUUID: usager.uuid,
      historyEndDate: IsNull(),
    });

    // Get last entry
    const previousState = await this.getLastHistoryState(usager);

    // Set null to last entry
    await usagerHistoryStatesRepository.update(
      {
        uuid: previousState.uuid,
      },
      { historyEndDate: null }
    );
  }

  async buildState({
    usager,
    createdAt,
    createdEvent,
    historyBeginDate,
  }: {
    usager: Usager;
    createdAt: Date;
    createdEvent: UsagerHistoryStateCreationEvent;
    historyBeginDate: Date;
  }): Promise<UsagerHistoryStates> {
    const previousState = this.getLastHistoryState(usager);
    let isActive = usager.decision.statut === "VALIDE";

    if (previousState) {
      // Update last decision
      await usagerHistoryStatesRepository.update(
        {
          usagerUUID: usager.uuid,
          historyEndDate: IsNull(),
        },
        {
          historyEndDate: getHistoryBeginDate(historyBeginDate ?? createdAt),
        }
      );

      isActive =
        isActive ||
        ((usager.decision.statut === "ATTENTE_DECISION" ||
          usager.decision.statut === "INSTRUCTION") &&
          (isActive ?? false));
    }

    const decision: Partial<UsagerDecision> = getDecisionForStats(
      usager.decision
    );

    const entretien: Partial<UsagerEntretien> = getEntretienForStats(
      usager.entretien
    );

    const ayantsDroits = getAyantsDroitForStats(usager?.ayantsDroits);

    let typeDom = usager?.typeDom ?? usager?.decision?.typeDom;

    if (!typeDom) {
      typeDom = "PREMIERE_DOM";
    }

    const state: UsagerHistoryStates = new UsagerHistoryStatesTable({
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
    });

    // Update previous states
    await usagerHistoryStatesRepository.save(state);

    return state;
  }

  private async getLastHistoryState(usager: Pick<Usager, "uuid">) {
    return usagerHistoryStatesRepository.findOne({
      where: {
        usagerUUID: usager.uuid,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }
}
