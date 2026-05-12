import { createFeature, createReducer, on } from "@ngrx/store";
import { UsersForAdminList } from "@domifa/common";

import { resetAppState } from "../app-store.actions";
import { UsersActions } from "./users.actions";

export interface UsersState {
  list: UsersForAdminList[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: UsersState = {
  list: [],
  loading: false,
  loaded: false,
  error: null,
};

export const usersFeature = createFeature({
  name: "adminUsers",
  reducer: createReducer(
    initialState,
    on(UsersActions.load, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(UsersActions.loadSuccess, (_state, { users }) => ({
      list: users,
      loading: false,
      loaded: true,
      error: null,
    })),
    on(UsersActions.loadFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(UsersActions.reset, () => initialState),
    on(resetAppState, () => initialState)
  ),
});

export const {
  name: usersFeatureKey,
  reducer: usersReducer,
  selectList: selectUsersList,
  selectLoading: selectUsersLoading,
  selectLoaded: selectUsersLoaded,
  selectError: selectUsersError,
} = usersFeature;
