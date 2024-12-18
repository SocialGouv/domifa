import { ApiStructureAdmin } from "../../admin-structures/types";
import { appStore } from "./appStore.service";

export const structuresCache = {
  getSnapshot: () => appStore.getState(),
  setStructureListData: (data: ApiStructureAdmin[]) => {
    appStore.dispatch({
      type: "set-structures-list-data",
      data,
    });
  },
  getStructureListData: () => {
    return appStore.getState()?.structureListData;
  },
};
