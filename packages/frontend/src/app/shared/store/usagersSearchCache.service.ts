import { UsagerLight } from "../../../_common/model";
import { appStore } from "./appStore.service";

export const usagersSearchCache = {
  getUsagersSnapshot: () => appStore.getState()?.usagers,
  setUsagers: (usagers: UsagerLight[]) => {
    appStore.dispatch({
      type: "set-usagers",
      usagers,
    });
  },
  updateUsager: (usager: UsagerLight) => {
    appStore.dispatch({
      type: "update-usager",
      usager,
    });
  },
  createUsager: (usager: UsagerLight) => {
    appStore.dispatch({
      type: "add-usager",
      usager,
    });
  },
  removeUsagersByCriteria: (criteria: Partial<UsagerLight>) => {
    appStore.dispatch({
      type: "delete-usager",
      criteria,
    });
  },
};
