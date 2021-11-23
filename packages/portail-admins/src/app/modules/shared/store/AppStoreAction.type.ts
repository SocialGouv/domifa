import {
  AdminStructureListData,
  AdminStructureStatsData,
} from "../../../../_common";

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
