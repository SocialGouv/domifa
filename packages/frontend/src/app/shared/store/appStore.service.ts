import { createStore } from "redux";
import { UsagerLight } from "../../../_common/model";
import { AppStoreAction } from "./AppStoreAction.type";
import { AppStoreModel } from "./AppStoreModel.type";

const INITIAL_STATE: AppStoreModel = {
  allUsagers: undefined,
  usagersByRefMap: {},
  interactionsByRefMap: {},
};

const appStoreReducer = (
  state: AppStoreModel,
  action: AppStoreAction
): AppStoreModel => {
  switch (action.type) {
    case "set-usagers": {
      return {
        ...state,
        allUsagers: action.usagers,
        usagersByRefMap: action.usagers.reduce((acc, u) => {
          acc[u.ref] = u;
          return acc;
        }, {} as { [ref: string]: UsagerLight }),
      };
    }
    case "update-usager": {
      const usager = action.usager;
      // update "allUsagers" only if defined
      const allUsagers = state.allUsagers
        ? state.allUsagers.map((u) => {
            if (u.uuid === usager.uuid) {
              return usager;
            }
            return u;
          })
        : undefined;
      // always update map
      const usagersByRefMap = {
        ...state.usagersByRefMap,
      };

      usagersByRefMap[usager.ref] = usager;
      return {
        ...state,
        allUsagers,
        usagersByRefMap,
      };
    }
    case "update-usager-interactions": {
      const { usagerRef, interactions } = action;
      // update map
      const interactionsByRefMap = {
        ...state.interactionsByRefMap,
      };

      interactionsByRefMap[usagerRef] = interactions;
      return {
        ...state,
        interactionsByRefMap,
      };
    }
    case "delete-usager": {
      const criteria = action.criteria;
      const attributes = Object.keys(criteria);
      const allUsagers = state.usagersByRefMap
        ? state.allUsagers.filter((u) =>
            attributes.some((attr) => criteria[attr] !== u[attr])
          )
        : undefined;
      const usagersByRefMap = {
        ...state.usagersByRefMap,
      };

      if (usagersByRefMap) {
        delete usagersByRefMap[criteria.ref];
      }
      return {
        ...state,
        allUsagers,
        usagersByRefMap,
      };
    }
    case "add-usager": {
      const usager = action.usager;
      const allUsagers = state.allUsagers
        ? state.allUsagers.concat([usager])
        : undefined;
      const usagersByRefMap = {
        ...state.usagersByRefMap,
      };
      usagersByRefMap[usager.ref] = usager;
      return {
        ...state,
        allUsagers,
      };
    }
    case "reset": {
      return INITIAL_STATE;
    }
  }
  return state;
};

export const appStore = createStore<
  AppStoreModel,
  AppStoreAction,
  unknown,
  unknown
>(appStoreReducer, INITIAL_STATE as AppStoreModel);
