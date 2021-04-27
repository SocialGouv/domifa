import { Usager } from "../../_common/model";

export type StructureUsagersExportModel = {
  exportDate: Date;
  usagers: Usager[];
  usagersInteractionsCountByType: {
    [usagerRef: number]: { [interactionType: string]: number };
  };
};
