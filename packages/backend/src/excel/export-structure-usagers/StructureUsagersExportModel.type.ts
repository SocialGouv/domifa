import { InteractionType } from "./../../_common/model/interaction/InteractionType.type";
import { Usager } from "../../_common/model";

export type StructureUsagersExportModel = {
  exportDate: Date;
  usagers: Usager[];
  usagersInteractionsCountByType: {
    [usagerRef: number]: { [interactionType in InteractionType]: number };
  };
};
