import { UsagerLight } from "../../../_common/model";
import { Interaction } from "../../modules/usager-shared/interfaces";

import { appStore } from "./appStore.service";

export const usagersCache = {
  getSnapshot: () => appStore.getState(),
  clearCache: () => appStore.dispatch({ type: "reset" }),
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
  updateUsagerInteractions: ({
    usagerRef,
    interactions,
  }: {
    usagerRef: number;
    interactions: Interaction[];
  }) => {
    appStore.dispatch({
      type: "update-usager-interactions",
      usagerRef,
      interactions,
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
