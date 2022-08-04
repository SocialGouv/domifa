import { UsagerLight } from "../../../_common/model";
import { appStore } from "./appStore.service";
import { SearchPageLoadedUsagersData } from "./AppStoreModel.type";

export const usagersCache = {
  getSnapshot: () => appStore.getState(),
  clearCache: () => appStore.dispatch({ type: "reset" }),
  setSearchPageLoadedUsagersData: (
    searchPageLoadedUsagersData: SearchPageLoadedUsagersData
  ) => {
    appStore.dispatch({
      type: "set-search-page-usagers",
      searchPageLoadedUsagersData,
    });
  },
  updateUsager: (usager: UsagerLight) => {
    appStore.dispatch({
      type: "update-usager",
      usager,
    });
  },
  updateUsagers: (usagers: UsagerLight[]) => {
    appStore.dispatch({
      type: "update-usagers",
      usagers,
    });
  },
  createUsager: (usager: UsagerLight) => {
    appStore.dispatch({
      type: "add-usager",
      usager,
    });
  },
  removeUsager: (criteria: Pick<UsagerLight, "ref">) => {
    appStore.dispatch({
      type: "delete-usager",
      criteria,
    });
  },
};
