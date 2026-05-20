import { createSelector } from "@ngrx/store";

import {
  selectUsersList,
  selectUsersLoaded,
  selectUsersLoading,
} from "./users.reducer";

export const selectAllAdminUsers = createSelector(selectUsersList, (users) =>
  users.map((user) => ({
    ...user,
    lastLogin: user?.lastLogin ? new Date(user.lastLogin) : null,
    passwordLastUpdate: user?.passwordLastUpdate
      ? new Date(user.passwordLastUpdate)
      : null,
    createdAt: user?.createdAt ? new Date(user.createdAt) : null,
    eventsHistory: (user?.eventsHistory ?? []).map((event) => ({
      ...event,
      date: new Date(event.date),
    })),
  }))
);

export const selectIsAdminUsersLoading = selectUsersLoading;
export const selectAreAdminUsersLoaded = selectUsersLoaded;

export const selectAdminUserById = (id: number) =>
  createSelector(selectAllAdminUsers, (users) =>
    users.find((u) => u.id === id)
  );
