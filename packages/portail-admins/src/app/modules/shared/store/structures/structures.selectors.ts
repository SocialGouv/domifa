import { createSelector } from "@ngrx/store";

import {
  selectStructuresList,
  selectStructuresLoaded,
  selectStructuresLoading,
} from "./structures.reducer";

export const selectAllStructures = selectStructuresList;
export const selectIsStructuresLoading = selectStructuresLoading;
export const selectAreStructuresLoaded = selectStructuresLoaded;

export const selectStructureById = (structureId: number) =>
  createSelector(selectAllStructures, (structures) =>
    structures.find((structure) => structure.id === structureId)
  );

export const selectStructureByUuid = (structureUuid: string) =>
  createSelector(selectAllStructures, (structures) =>
    structures.find((structure) => structure.uuid === structureUuid)
  );
