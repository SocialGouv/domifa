import moment = require("moment");
import { UsagerHistoryTable } from "../../database/entities/usager/UsagerHistoryTable.typeorm";
import { usagerHistoryRepository } from "../../database/services/usager/usagerHistoryRepository.service";
import { uuidGenerator } from "../../database/services/uuid";
import {
  AppUserResume,
  Usager,
  UsagerHistory,
  UsagerHistoryState,
} from "../../_common/model";
import { UsagerHistoryStateCreationEvent } from "../../_common/model/usager/history/UsagerHistoryStateCreationEvent.type";

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
  return moment.utc(date).startOf("day").toDate();
}

function getHistoryEndDateFromNextBeginDate(date: Date) {
  return moment.utc(date).add(-1, "day").endOf("day").toDate();
}

function buildInitialHistoryState({
  isImport,
  usager,
  createdAt = new Date(),
  createdEvent,
  historyBeginDate = createdAt,
}: {
  isImport: boolean;
  usager: Pick<
    Usager,
    | "uuid"
    | "ref"
    | "structureId"
    | "decision"
    | "typeDom"
    | "entretien"
    | "ayantsDroits"
    | "etapeDemande"
    | "rdv"
  >;
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
          createdBy: {
            userId: usager.decision.userId,
            userName: usager.decision.userName,
          },
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
  usager: Pick<
    Usager,
    | "uuid"
    | "decision"
    | "typeDom"
    | "entretien"
    | "ayantsDroits"
    | "etapeDemande"
    | "rdv"
  >;
  createdAt?: Date;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate?: Date;
}): Promise<UsagerHistory> {
  const usagerHistory: UsagerHistory = await usagerHistoryRepository.findOne({
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
  usager: Pick<
    Usager,
    | "uuid"
    | "decision"
    | "typeDom"
    | "entretien"
    | "ayantsDroits"
    | "etapeDemande"
    | "rdv"
  >;
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
  const createdBy: AppUserResume = {
    userId: decision.userId,
    userName: decision.userName,
  };
  const newHistoryState: UsagerHistoryState = buildHistoryState({
    usager,
    usagerHistory,
    createdAt,
    createdBy,
    createdEvent,
    historyBeginDate,
  });
  const newHistory = addNewStateToHistory({ usagerHistory, newHistoryState });

  return newHistory;
}

function addNewStateToHistory({
  usagerHistory,
  newHistoryState,
}: {
  usagerHistory: UsagerHistory;
  newHistoryState: UsagerHistoryState;
}) {
  return {
    ...usagerHistory,
    states: [
      ...usagerHistory.states.map((state, i) => {
        if (i === usagerHistory.states.length - 1) {
          // finish previous history state
          state.historyEndDate = getHistoryEndDateFromNextBeginDate(
            newHistoryState.historyBeginDate
          );
        }
        return state;
      }),
      newHistoryState,
    ],
  };
}

async function updateHistoryStateWithoutDecision({
  usager,
  createdBy,
  createdAt = new Date(),
  createdEvent,
  historyBeginDate = createdAt,
}: {
  usager: Pick<
    Usager,
    | "uuid"
    | "decision"
    | "typeDom"
    | "entretien"
    | "ayantsDroits"
    | "etapeDemande"
    | "rdv"
  >;
  createdBy: AppUserResume;
  createdAt?: Date;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate?: Date;
}): Promise<UsagerHistory> {
  const usagerHistory: UsagerHistory = await usagerHistoryRepository.findOne({
    usagerUUID: usager.uuid,
  });

  const newHistoryState: UsagerHistoryState = buildHistoryState({
    usager,
    usagerHistory,
    createdAt,
    createdBy,
    createdEvent,
    historyBeginDate,
  });

  const newHistory = addNewStateToHistory({ usagerHistory, newHistoryState });

  return usagerHistoryRepository.save(newHistory);
}

async function removeLastDecisionFromHistory({
  usager,
  createdBy,
  createdAt = new Date(),
  historyBeginDate = createdAt,
  removedDecisionUUID,
}: {
  usager: Pick<
    Usager,
    | "uuid"
    | "decision"
    | "typeDom"
    | "entretien"
    | "ayantsDroits"
    | "etapeDemande"
    | "rdv"
  >;
  createdBy: AppUserResume;
  createdAt?: Date;
  historyBeginDate?: Date;
  removedDecisionUUID: string;
}): Promise<UsagerHistory> {
  const usagerHistory: UsagerHistory = await usagerHistoryRepository.findOne({
    usagerUUID: usager.uuid,
  });

  usagerHistory.states = usagerHistory.states.filter(
    (s) => s.decision?.uuid !== removedDecisionUUID // remove all states related to removed decision
  );

  // add an extra state to keep track of this change, and be sure all attributes are up to date
  const newHistoryState: UsagerHistoryState = buildHistoryState({
    usager,
    usagerHistory,
    createdAt,
    createdBy,
    createdEvent: "delete-decision",
    historyBeginDate,
  });

  const newHistory = addNewStateToHistory({ usagerHistory, newHistoryState });

  return usagerHistoryRepository.save(newHistory);
}

function buildHistoryState({
  usager,
  usagerHistory,
  createdAt,
  createdBy,
  createdEvent,
  historyBeginDate,
}: {
  usager: Pick<
    Usager,
    | "decision"
    | "typeDom"
    | "entretien"
    | "ayantsDroits"
    | "etapeDemande"
    | "rdv"
  >;
  usagerHistory: UsagerHistory;
  createdAt: Date;
  createdBy: AppUserResume;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate: Date;
}): UsagerHistoryState {
  const decision = {
    ...usager.decision,
  };

  const previousState = usagerHistory.states.length
    ? usagerHistory.states[usagerHistory.states.length - 1]
    : undefined;

  const isActive =
    decision.statut === "VALIDE" ||
    ((decision.statut === "ATTENTE_DECISION" ||
      decision.statut === "INSTRUCTION") &&
      (previousState?.isActive ?? false));

  const state: UsagerHistoryState = {
    uuid: uuidGenerator.random(),
    createdAt,
    createdBy,
    createdEvent,
    isActive,
    historyBeginDate: getHistoryBeginDate(
      historyBeginDate ? historyBeginDate : createdAt
    ),
    historyEndDate: undefined,
    decision,
    typeDom: usager.typeDom,
    etapeDemande: usager.etapeDemande,
    entretien: {
      ...usager.entretien,
    },
    ayantsDroits: [...usager.ayantsDroits],
    rdv: {
      ...usager.rdv,
    },
  };

  return state;
}
