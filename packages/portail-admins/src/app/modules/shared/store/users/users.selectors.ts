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
  }))
);

export const selectIsAdminUsersLoading = selectUsersLoading;
export const selectAreAdminUsersLoaded = selectUsersLoaded;

export const selectAdminUserByUuid = (uuid: string) =>
  createSelector(selectAllAdminUsers, (users) =>
    users.find((u) => u.uuid === uuid)
  );
