import { AdminStructureStatsData } from "@domifa/common";
import { AdminStructureListData } from "../../../../_common";

export type AppStoreAction =
  | {
      type: "set-structures-list-data";
      data: AdminStructureListData;
    }
  | {
      type: "set-structures-stats-data";
      data: AdminStructureStatsData;
    }
  | {
      type: "reset";
    };
