import { ApiStructureAdmin } from "../../admin-structures/types";

export type AppStoreAction =
  | {
      type: "set-structures-list-data";
      data: ApiStructureAdmin[];
    }
  | {
      type: "update-structure";
      data: ApiStructureAdmin;
    }
  | {
      type: "reset";
    };
