import { StructureAdmin } from "../../admin-structures/types";

export type AppStoreAction =
  | {
      type: "set-structures-list-data";
      data: StructureAdmin[];
    }
  | {
      type: "reset";
    };
