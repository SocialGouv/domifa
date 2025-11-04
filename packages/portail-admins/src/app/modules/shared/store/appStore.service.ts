import { createStore, Reducer } from "redux";
import { AppStoreAction } from "./AppStoreAction.type";
import { AppStoreModel } from "./AppStoreModel.type";

const INITIAL_STATE: AppStoreModel = {
  structureListData: undefined,
};

const appStoreReducer: Reducer<AppStoreModel | undefined, AppStoreAction> = (
  state: AppStoreModel | undefined,
  action: AppStoreAction
): AppStoreModel => {
  switch (action.type) {
    case "set-structures-list-data": {
      return {
        ...state,
        structureListData: action.data,
      };
    }
    case "update-structure":
      console.log("update_STRUCTURE");
      return {
        ...state,
        structureListData: state.structureListData?.map((structure) =>
          structure.id === action.data.id ? action.data : structure
        ),
      };
    case "reset": {
      return INITIAL_STATE;
    }
    default:
      return state ?? INITIAL_STATE;
  }
};

export const appStore = createStore<
  AppStoreModel | undefined,
  AppStoreAction,
  unknown,
  unknown
>(appStoreReducer, INITIAL_STATE);
