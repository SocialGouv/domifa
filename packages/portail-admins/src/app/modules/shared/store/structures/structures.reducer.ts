import { createFeature, createReducer, on } from "@ngrx/store";
import { StructureAdmin } from "@domifa/common";

import { resetAppState } from "../app-store.actions";
import { StructuresActions } from "./structures.actions";

export interface StructuresState {
  list: StructureAdmin[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: StructuresState = {
  list: [],
  loading: false,
  loaded: false,
  error: null,
};

export const structuresFeature = createFeature({
  name: "structures",
  reducer: createReducer(
    initialState,
    on(StructuresActions.load, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(StructuresActions.loadSuccess, (_state, { structures }) => ({
      list: structures,
      loading: false,
      loaded: true,
      error: null,
    })),
    on(StructuresActions.loadFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(StructuresActions.updateOne, (state, { structure }) => ({
      ...state,
      list: state.list.map((current) =>
        current.id === structure.id ? structure : current
      ),
    })),
    on(StructuresActions.reset, () => initialState),
    on(resetAppState, () => initialState)
  ),
});

export const {
  name: structuresFeatureKey,
  reducer: structuresReducer,
  selectList: selectStructuresList,
  selectLoading: selectStructuresLoading,
  selectLoaded: selectStructuresLoaded,
  selectError: selectStructuresError,
} = structuresFeature;
