import { UsagerHistoryTable } from "../../database/entities/usager/UsagerHistoryTable.typeorm";
import { usagerHistoryRepository } from "../../database/services/usager/usagerHistoryRepository.service";
import { UserStructureResume } from "@domifa/common";
import { Usager, UsagerHistory, UsagerHistoryState } from "../../_common/model";
import { UsagerHistoryStateCreationEvent } from "../../_common/model/usager/history/UsagerHistoryStateCreationEvent.type";
import { v4 as uuidv4 } from "uuid";
import { endOfDay, startOfDay, subDays } from "date-fns";

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

function getHistoryEndDateFromNextBeginDate(date: Date) {
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

  const createdBy: UserStructureResume = {
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

  return addNewStateToHistory({ usagerHistory, newHistoryState });
}

function addNewStateToHistory({
  usagerHistory,
  newHistoryState,
}: {
  usagerHistory: UsagerHistory;
  newHistoryState: UsagerHistoryState;
}) {
  const states: UsagerHistoryState[] = [
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
  ];

  return {
    ...usagerHistory,
    states,
  };
}

async function updateHistoryStateWithoutDecision({
  usager,
  createdBy,
  createdAt = new Date(),
  createdEvent,
  historyBeginDate = createdAt,
}: {
  usager: Usager;
  createdBy: UserStructureResume;
  createdAt?: Date;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate?: Date;
}): Promise<UsagerHistory> {
  const usagerHistory: UsagerHistory = await usagerHistoryRepository.findOneBy({
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
        state.ayantsDroits = usager.ayantsDroits;
        state.entretien = {
          ...usager.entretien,
          commentaires: null,
          revenusDetail: null,
          orientationDetail: null,
          liencommuneDetail: null,
          residenceDetail: null,
          causeDetail: null,
          rattachement: null,
          raisonDetail: null,
          accompagnementDetail: null,
        };
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
  createdBy,
  createdEvent,
  historyBeginDate,
}: {
  usager: Usager;
  usagerHistory: UsagerHistory;
  createdAt: Date;
  createdBy: UserStructureResume;
  createdEvent: UsagerHistoryStateCreationEvent;
  historyBeginDate: Date;
}): UsagerHistoryState {
  const decision = {
    ...usager.decision,
  };

  const previousState = usagerHistory?.states.length
    ? usagerHistory.states[usagerHistory.states.length - 1]
    : undefined;

  const isActive =
    decision.statut === "VALIDE" ||
    ((decision.statut === "ATTENTE_DECISION" ||
      decision.statut === "INSTRUCTION") &&
      (previousState?.isActive ?? false));

  const state: UsagerHistoryState = {
    uuid: uuidv4(),
    createdAt,
    createdBy,
    createdEvent,
    isActive,
    historyBeginDate: getHistoryBeginDate(historyBeginDate ?? createdAt),
    historyEndDate: undefined,
    decision,
    typeDom: usager.typeDom,
    etapeDemande: usager.etapeDemande,
    entretien: {
      ...usager.entretien,
    },
    ayantsDroits: [...usager.ayantsDroits],
    rdv: usager.rdv,
  };

  return state;
}
