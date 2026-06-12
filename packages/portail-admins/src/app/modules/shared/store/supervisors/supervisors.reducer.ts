import { createFeature, createReducer, on } from "@ngrx/store";
import { UserSupervisor } from "@domifa/common";

import { resetAppState } from "../app-store.actions";
import { SupervisorsActions } from "./supervisors.actions";

export interface SupervisorsState {
  list: UserSupervisor[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: SupervisorsState = {
  list: [],
  loading: false,
  loaded: false,
  error: null,
};

export const supervisorsFeature = createFeature({
  name: "adminSupervisors",
  reducer: createReducer(
    initialState,
    on(SupervisorsActions.load, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(SupervisorsActions.loadSuccess, (_state, { supervisors }) => ({
      list: supervisors,
      loading: false,
      loaded: true,
      error: null,
    })),
    on(SupervisorsActions.loadFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(SupervisorsActions.updateOne, (state, { supervisor }) => ({
      ...state,
      list: state.list.map((current) =>
        current.uuid === supervisor.uuid ? supervisor : current
      ),
    })),
    on(SupervisorsActions.reset, () => initialState),
    on(resetAppState, () => initialState)
  ),
});

export const {
  name: supervisorsFeatureKey,
  reducer: supervisorsReducer,
  selectList: selectSupervisorsList,
  selectLoading: selectSupervisorsLoading,
  selectLoaded: selectSupervisorsLoaded,
  selectError: selectSupervisorsError,
} = supervisorsFeature;
