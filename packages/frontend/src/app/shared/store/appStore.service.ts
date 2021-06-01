import { createStore } from "redux";
import { AppStoreAction } from "./AppStoreAction.type";
import { AppStoreModel } from "./AppStoreModel.type";

const appStoreReducer = (
  state: AppStoreModel,
  action: AppStoreAction
): AppStoreModel => {
  switch (action.type) {
    case "set-usagers": {
      return {
        ...state,
        usagers: action.usagers,
      };
    }
    case "update-usager": {
      const usager = action.usager;
      const usagers = state.usagers
        ? state.usagers.map((u) => {
            if (u.uuid === usager.uuid) {
              return usager;
            }
            return u;
          })
        : undefined;
      return {
        ...state,
        usagers,
      };
    }
    case "delete-usager": {
      const criteria = action.criteria;
      const attributes = Object.keys(criteria);
      const usagers = state.usagers
        ? state.usagers.filter((u) =>
            attributes.some((attr) => criteria[attr] !== u[attr])
          )
        : undefined;
      return {
        ...state,
        usagers,
      };
    }
    case "add-usager": {
      const usager = action.usager;
      const usagers = state.usagers
        ? state.usagers.concat([usager])
        : undefined;
      return {
        ...state,
        usagers,
      };
    }
  }
  return state;
};

export const appStore = createStore<
  AppStoreModel,
  AppStoreAction,
  unknown,
  unknown
>(appStoreReducer, {
  usagers: undefined,
} as AppStoreModel);
