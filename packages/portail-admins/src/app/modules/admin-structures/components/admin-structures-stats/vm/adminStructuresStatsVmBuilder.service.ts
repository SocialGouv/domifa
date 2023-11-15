import {
  InteractionType,
  StructureType,
  UsagerDecisionStatut,
  INTERACTIONS_LABELS_PLURIEL,
} from "@domifa/common";
import { AdminStructureStatsData } from "../../../../../../_common";
import {
  DASHBOARD_STATUS_LABELS,
  STRUCTURE_TYPE_LABELS,
} from "../../../../../../_common/usager/constants";
import { AdminStructuresStatsVM } from "./AdminStructuresStatsVM.type";

export const adminStructuresStatsVmBuilder = { buildViewModel };

function buildViewModel(data: AdminStructureStatsData): AdminStructuresStatsVM {
  const interactionsCountByType = buildInteractionsCountByType(data);
  const structuresCountByType = buildStructuresCountByType(data);
  const usagersCountByStatut = buildUsagersCountByStatut(data);
  const usagersCount = data.usagersCountByStatutMap.TOUS;
  return {
    ...data,
    usagersCount,
    usagersCountByStatut,
    interactionsCountByType,
    structuresCountByType,
  };
}

function buildStructuresCountByType(
  data: AdminStructureStatsData
): { type: StructureType; label: string; count: number }[] {
  return Object.keys(data.structuresCountByTypeMap)
    .filter((key) => key === "total")
    .map((key) => {
      const type = key as StructureType;
      return {
        type,
        label: STRUCTURE_TYPE_LABELS[type],
        count: data.structuresCountByTypeMap[type] as number,
      };
    });
}

function buildInteractionsCountByType(
  data: AdminStructureStatsData
): { type: InteractionType; label: string; count: number }[] {
  return Object.keys(data.interactionsCountByTypeMap).map((key) => {
    const type = key as InteractionType;
    return {
      type,
      label: INTERACTIONS_LABELS_PLURIEL[type],
      count: data.interactionsCountByTypeMap[type] as number,
    };
  });
}

const USAGER_COUNT_STATUS = [
  "VALIDE",
  "INSTRUCTION",
  "ATTENTE_DECISION",
  "REFUS",
  "RADIE",
  "AYANTS_DROITS",
];

function buildUsagersCountByStatut(
  data: AdminStructureStatsData
): { status: UsagerDecisionStatut; label: string; count: number }[] {
  return USAGER_COUNT_STATUS.map((key) => {
    const status = key as UsagerDecisionStatut;
    return {
      status,
      label: DASHBOARD_STATUS_LABELS[status],
      count: (data.usagersCountByStatutMap[status] as number) ?? 0,
    };
  });
}
