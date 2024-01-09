import { UsagerHistoryTable } from "../../database/entities/usager/UsagerHistoryTable.typeorm";
import { usagerHistoryRepository } from "../../database/services/usager/usagerHistoryRepository.service";
import { Usager, UsagerHistory, UsagerHistoryState } from "../../_common/model";
import { UsagerHistoryStateCreationEvent } from "../../_common/model/usager/history/UsagerHistoryStateCreationEvent.type";
import { v4 as uuidv4 } from "uuid";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { UsagerDecision, UsagerEntretien } from "@domifa/common";
import {
  getAyantsDroitForStats,
  getDecisionForStats,
  getEntretienForStats,
} from ".";

export const usagerHistoryStateManager = {
  buildInitialHistoryState,
  buildHistoryState,
  updateHistoryStateFromDecision,
  updateHistoryStateWithoutDecision,
  removeLastDecisionFromHistory,
  getHistoryBeginDate,
  getHistoryEndDateFromNextBeginDate,
};

function getHistoryBeginDate(date: Date) {
  return startOfDay(new Date(date));
}

export function getHistoryEndDateFromNextBeginDate(date: Date) {
  return endOfDay(subDays(new Date(date), 1));
}

function buildInitialHistoryState({
  isImport,
  usager,
  createdAt = new Date(),
  createdEvent,
  historyBeginDate = createdAt,
}: {
  isImport: boolean;
  usager: Usager;
  createdAt?: Date;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate?: Date;
}): UsagerHistory {
  let usagerHistory = new UsagerHistoryTable({
    usagerUUID: usager.uuid,
    structureId: usager.structureId,
    usagerRef: usager.ref,
    states: [],
    import: isImport
      ? {
          createdAt,
        }
      : undefined,
  });

  if (usager.decision) {
    usagerHistory = buildHistoryFromNewDecision({
      usager,
      usagerHistory,
      createdAt,
      createdEvent,
      historyBeginDate,
    });
  }
  return usagerHistory;
}

async function updateHistoryStateFromDecision({
  usager,
  createdAt = new Date(),
  createdEvent,
  historyBeginDate = createdAt,
}: {
  usager: Usager;
  createdAt?: Date;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate?: Date;
}): Promise<UsagerHistory> {
  const usagerHistory: UsagerHistory = await usagerHistoryRepository.findOneBy({
    usagerUUID: usager.uuid,
  });

  const newHistory = buildHistoryFromNewDecision({
    usager,
    usagerHistory,
    createdAt,
    createdEvent,
    historyBeginDate,
  });

  return usagerHistoryRepository.save(newHistory);
}

function buildHistoryFromNewDecision({
  usager,
  usagerHistory,
  createdAt = new Date(),
  createdEvent,
  historyBeginDate = createdAt,
}: {
  usager: Usager;
  usagerHistory: UsagerHistory;
  createdAt?: Date;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate?: Date;
}) {
  const decision = usager.decision;
  if (!decision.typeDom) {
    decision.typeDom = usager.typeDom;
  }
  if (!decision.dateDebut) {
    decision.dateDebut = decision.dateDecision;
  }

  if (!usagerHistory) {
    usagerHistory = usagerHistoryStateManager.buildInitialHistoryState({
      isImport: false,
      usager,
      createdAt: usager.decision.dateDecision,
      createdEvent: "new-decision",
      historyBeginDate: usager.decision.dateDebut,
    });
  }

  const newHistoryState: UsagerHistoryState = buildHistoryState({
    usager,
    usagerHistory,
    createdAt,
    createdEvent,
    historyBeginDate,
  });

  return addNewStateToHistory({ usagerHistory, newHistoryState });
}

function addNewStateToHistory({
  usagerHistory,
  newHistoryState,
}: {
  usagerHistory: UsagerHistory;
  newHistoryState: UsagerHistoryState;
}) {
  if (
    typeof usagerHistory.states[usagerHistory.states.length - 1] !== "undefined"
  ) {
    usagerHistory.states[usagerHistory.states.length - 1].historyEndDate =
      getHistoryEndDateFromNextBeginDate(newHistoryState.historyBeginDate);
  }
  usagerHistory.states.push(newHistoryState);
  return usagerHistory;
}

async function updateHistoryStateWithoutDecision({
  usager,
  createdEvent,
}: {
  usager: Usager;
  createdEvent: UsagerHistoryStateCreationEvent;
}): Promise<UsagerHistory> {
  const usagerHistory: UsagerHistory = await usagerHistoryRepository.findOneBy({
    usagerUUID: usager.uuid,
  });

  const createdAt = new Date();
  const historyBeginDate = createdAt;

  const newHistoryState: UsagerHistoryState = buildHistoryState({
    usager,
    usagerHistory,
    createdAt,
    createdEvent,
    historyBeginDate,
  });

  const newHistory = addNewStateToHistory({ usagerHistory, newHistoryState });

  return usagerHistoryRepository.save(newHistory);
}

async function removeLastDecisionFromHistory({
  usager,
  removedDecisionUUID,
}: {
  usager: Usager;
  removedDecisionUUID: string;
}): Promise<UsagerHistory> {
  const usagerHistory: UsagerHistory = await usagerHistoryRepository.findOneBy({
    usagerUUID: usager.uuid,
  });

  usagerHistory.states = usagerHistory.states.filter(
    (s) => s.decision?.uuid !== removedDecisionUUID // remove all states related to removed decision
  );

  // Update "entretien" and "ayantsDroits" with the currently stored values
  const lastDecisionUuid =
    usagerHistory.states[usagerHistory.states.length - 1].decision.uuid;

  const updatedHistoryStates = usagerHistory.states.map(
    (state: UsagerHistoryState) => {
      if (state.decision.uuid === lastDecisionUuid) {
        state.ayantsDroits = getAyantsDroitForStats(usager?.ayantsDroits);
        state.entretien = getEntretienForStats(usager.entretien);
        state.historyEndDate = null;
      }
      return state;
    }
  );

  await usagerHistoryRepository.update(
    { uuid: usagerHistory.uuid },
    { states: updatedHistoryStates }
  );

  return usagerHistoryRepository.findOneBy({
    uuid: usagerHistory.uuid,
  });
}

function buildHistoryState({
  usager,
  usagerHistory,
  createdAt,
  createdEvent,
  historyBeginDate,
}: {
  usager: Usager;
  usagerHistory: UsagerHistory;
  createdAt: Date;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate: Date;
}): UsagerHistoryState {
  const decision: Partial<UsagerDecision> = getDecisionForStats(
    usager.decision
  );

  const entretien: Partial<UsagerEntretien> = getEntretienForStats(
    usager.entretien
  );

  const previousState = usagerHistory?.states.length
    ? usagerHistory.states[usagerHistory.states.length - 1]
    : undefined;

  const isActive =
    decision.statut === "VALIDE" ||
    ((decision.statut === "ATTENTE_DECISION" ||
      decision.statut === "INSTRUCTION") &&
      (previousState?.isActive ?? false));

  const ayantsDroits = getAyantsDroitForStats(usager?.ayantsDroits);

  const state: UsagerHistoryState = {
    uuid: uuidv4(),
    createdAt,
    createdEvent,
    isActive,
    historyBeginDate: getHistoryBeginDate(historyBeginDate ?? createdAt),
    historyEndDate: undefined,
    decision,
    typeDom: usager.typeDom,
    etapeDemande: usager.etapeDemande,
    entretien,
    ayantsDroits,
    rdv: { dateRdv: usager?.rdv?.dateRdv },
  };

  return state;
}
