import {
  createAction,
  createFeatureSelector,
  createSelector,
  props,
} from "@ngrx/store";
import { Usager } from "../../../_common/model";
import {
  AppStoreModel,
  SearchPageLoadedUsagersData,
} from "./AppStoreModel.type";

export const cacheManager = {
  updateUsagerNotes: createAction(
    "update-usager-notes",
    props<{ ref: string; notes: number }>()
  ),
  clearCache: createAction("[VotreFeature] Reset Data"),
  addUsager: createAction("add-usager", props<{ usager: Usager }>()),
  updateUsager: createAction("update-usager", props<{ usager: Usager }>()),
  updateUsagers: createAction("update-usagers", props<{ usagers: Usager[] }>()),
  deleteUsager: createAction("delete-usager", props<{ usagerRef: number }>()),
  setSearchPageLoadedUsagersData: createAction(
    "set-search-page-usagers",
    props<{ searchPageLoadedUsagersData: SearchPageLoadedUsagersData }>()
  ),
  getUsagersMap: createFeatureSelector<AppStoreModel>("app"),
};

export const selectUsagerByRef = (usagerRef: string) =>
  createSelector(cacheManager.getUsagersMap, (appStore: AppStoreModel) => {
    return appStore.usagersByRefMap[usagerRef];
  });

export const selectSearchPageLoadedUsagersData = () =>
  createSelector(
    cacheManager.getUsagersMap,
    (state: AppStoreModel) => state.searchPageLoadedUsagersData
  );
