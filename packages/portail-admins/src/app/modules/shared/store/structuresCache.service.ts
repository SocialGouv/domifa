import { StructureAdmin } from "@domifa/common";
import { appStore } from "./appStore.service";
export const structuresCache = {
  getSnapshot: () => appStore.getState(),
  setStructureListData: (data: StructureAdmin[]) => {
    appStore.dispatch({
      type: "set-structures-list-data",
      data,
    });
  },
  getStructureListData: () => {
    return appStore.getState()?.structureListData;
  },

  getStructureById: (structureId: number): StructureAdmin | undefined => {
    return appStore
      .getState()
      .structureListData?.find((structure) => structure.id === structureId);
  },
  updateStructure: (updatedStructure: StructureAdmin) => {
    appStore.dispatch({
      type: "update-structure",
      data: updatedStructure,
    });
  },
};
