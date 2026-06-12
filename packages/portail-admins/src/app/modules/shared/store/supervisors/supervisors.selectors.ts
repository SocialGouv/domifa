import { createSelector } from "@ngrx/store";

import {
  selectSupervisorsList,
  selectSupervisorsLoaded,
  selectSupervisorsLoading,
} from "./supervisors.reducer";

export const selectAllSupervisors = createSelector(
  selectSupervisorsList,
  (supervisors) =>
    supervisors.map((supervisor) => ({
      ...supervisor,
      lastLogin: supervisor?.lastLogin ? new Date(supervisor.lastLogin) : null,
      createdAt: supervisor?.createdAt ? new Date(supervisor.createdAt) : null,
    }))
);

export const selectIsSupervisorsLoading = selectSupervisorsLoading;
export const selectAreSupervisorsLoaded = selectSupervisorsLoaded;

export const selectSupervisorByUuid = (uuid: string) =>
  createSelector(selectAllSupervisors, (supervisors) =>
    supervisors.find((s) => s.uuid === uuid)
  );
