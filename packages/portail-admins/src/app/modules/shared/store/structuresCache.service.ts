import { AdminStructureStatsData } from "@domifa/common";
import { AdminStructureListData } from "../../../../_common";
import { appStore } from "./appStore.service";

export const structuresCache = {
  getSnapshot: () => appStore.getState(),
  setStructureListData: (data: AdminStructureListData) => {
    appStore.dispatch({
      type: "set-structures-list-data",
      data,
    });
  },
  setStructureStatsData: (data: AdminStructureStatsData) => {
    appStore.dispatch({
      type: "set-structures-stats-data",
      data,
    });
  },
  getStructureListData: () => {
    return appStore.getState()?.structureListData;
  },
  getStructureStatsData: () => {
    return appStore.getState()?.structureStatsData;
  },
};
