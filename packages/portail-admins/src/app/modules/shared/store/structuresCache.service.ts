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

  getStructureById: (structureId: number): ApiStructureAdmin | undefined => {
    return appStore
      .getState()
      .structureListData?.find((structure) => structure.id === structureId);
  },
  updateStructure: (updatedStructure: ApiStructureAdmin) => {
    appStore.dispatch({
      type: "update-structure",
      data: updatedStructure,
    });
  },
};
