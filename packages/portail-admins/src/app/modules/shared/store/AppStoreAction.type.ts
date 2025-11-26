import { StructureAdmin } from "@domifa/common";

export type AppStoreAction =
  | {
      type: "set-structures-list-data";
      data: StructureAdmin[];
    }
  | {
      type: "update-structure";
      data: StructureAdmin;
    }
  | {
      type: "reset";
    };
