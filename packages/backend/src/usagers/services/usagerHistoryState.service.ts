import { Usager, UsagerDecision, UsagerEntretien } from "@domifa/common";
import { Injectable } from "@nestjs/common";
import {
  UsagerHistoryStateCreationEvent,
  UsagerHistoryStates,
} from "../../_common/model";
import {
  getDecisionForStats,
  getEntretienForStats,
  getAyantsDroitForStats,
} from "../utils/dataCleanerForStats.service";
import { UsagerHistoryStatesTable } from "../../database/entities/usager/UsagerHistoryStatesTable.typeorm";

import { usagerHistoryStatesRepository } from "../../database";
import { IsNull } from "typeorm";
import { getHistoryBeginDate } from "./usagerHistoryStateManager.service";

@Injectable()
export class UsagerHistoryStateService {
  async deleteHistoryState(
    usager: Pick<Usager, "uuid" | "decision">
  ): Promise<void> {
    await usagerHistoryStatesRepository
      .createQueryBuilder()
      .delete()
      .where(
        `"usagerUUID"= :usagerUUID and decision->>'uuid' = :decisionUuid`,
        {
          usagerUUID: usager.uuid,
          decisionUuid: usager.decision.uuid,
        }
      )
      .execute();

    // Get last entry
    const previousState = await this.getLastHistoryState(usager);

    if (previousState) {
      await usagerHistoryStatesRepository.update(
        {
          uuid: previousState.uuid,
        },
        { historyEndDate: null }
      );
    }
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
    let isActive = usager.decision.statut === "VALIDE";

    const previousState = await this.getLastHistoryState(usager);

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
          previousState?.isActive);
    }

    const state = this.createState({
      usager,
      createdAt,
      createdEvent,
      historyBeginDate,
      isActive,
    });

    // Update previous states
    await usagerHistoryStatesRepository.save(state);

    return state;
  }

  public createState({
    usager,
    createdAt,
    createdEvent,
    historyBeginDate,
    isActive,
  }: {
    usager: Usager;
    createdAt: Date;
    createdEvent: UsagerHistoryStateCreationEvent;
    historyBeginDate: Date;
    isActive: boolean;
  }): UsagerHistoryStates {
    const decision: Partial<UsagerDecision> = getDecisionForStats(
      usager.decision
    );

    const entretien: Partial<UsagerEntretien> = getEntretienForStats(
      usager?.entretien as UsagerEntretien
    );

    const ayantsDroits = getAyantsDroitForStats(usager?.ayantsDroits);

    let typeDom = usager?.typeDom ?? usager?.decision?.typeDom;

    if (!typeDom) {
      typeDom = "PREMIERE_DOM";
    }

    return new UsagerHistoryStatesTable({
      usagerUUID: usager.uuid,
      structureId: usager.structureId,
      createdAt,
      createdEvent,
      isActive,
      nationalite: usager.nationalite,
      sexe: usager.sexe,
      dateNaissance: usager.dateNaissance,
      historyBeginDate: getHistoryBeginDate(historyBeginDate ?? createdAt),
      historyEndDate: undefined,
      decision,
      typeDom,
      entretien,
      ayantsDroits,
      rdv: { dateRdv: usager?.rdv?.dateRdv },
    });
  }

  private async getLastHistoryState(usager: Pick<Usager, "uuid">) {
    return await usagerHistoryStatesRepository.findOne({
      where: {
        usagerUUID: usager.uuid,
      },
      order: {
        createdAt: "DESC",
      },
    });
  }
}
