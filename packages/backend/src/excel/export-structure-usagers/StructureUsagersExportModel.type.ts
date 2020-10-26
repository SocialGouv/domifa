import { Usager } from "../../usagers/interfaces/usagers";

export type StructureUsagersExportModel = {
  exportDate: Date;
  usagers: Usager[];
  usagersInteractionsCountByType: {
    [usagerId: string]: { [interactionType: string]: number };
  };
};
