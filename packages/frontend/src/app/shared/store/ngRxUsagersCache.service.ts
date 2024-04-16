import {
  createAction,
  createFeatureSelector,
  createSelector,
  props,
} from "@ngrx/store";
import { UsagerLight } from "../../../_common/model";
import {
  AppStoreModel,
  SearchPageLoadedUsagersData,
} from "./AppStoreModel.type";
import { Usager } from "@domifa/common";

export const cacheManager = {
  updateUsagerNotes: createAction(
    "update-usager-notes",
    props<{ ref: string; nbNotes: number }>()
  ),
  clearCache: createAction("clear-cache"),
  addUsager: createAction("add-usager", props<{ usager: Usager }>()),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUsager: createAction(
    "update-usager",
    props<{ usager: Usager | UsagerLight }>()
  ),
  updateUsagers: createAction("update-usagers", props<{ usagers: Usager[] }>()),
  deleteUsagers: createAction(
    "delete-usagers",
    props<{ usagerRefs: number[] }>()
  ),
  setSearchPageLoadedUsagersData: createAction(
    "set-search-page-usagers",
    props<{ searchPageLoadedUsagersData: SearchPageLoadedUsagersData }>()
  ),
  getUsagersMap: createFeatureSelector<AppStoreModel>("app"),
};

export const selectUsagerByRef = (usagerRef: string) =>
  createSelector(
    cacheManager.getUsagersMap,
    (usagersMap) => usagersMap.usagersByRefMap[usagerRef]
  );

export const selectSearchPageLoadedUsagersData = () =>
  createSelector(
    cacheManager.getUsagersMap,
    (state: AppStoreModel) => state.searchPageLoadedUsagersData
  );
