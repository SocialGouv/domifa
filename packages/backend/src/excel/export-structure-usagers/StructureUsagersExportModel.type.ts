import { UsagerPG } from "../../database";

export type StructureUsagersExportModel = {
  exportDate: Date;
  usagers: UsagerPG[];
  usagersInteractionsCountByType: {
    [usagerRef: number]: { [interactionType: string]: number };
  };
};
