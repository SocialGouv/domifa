import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { UserSupervisor } from "@domifa/common";

export const SupervisorsActions = createActionGroup({
  source: "Admin Supervisors",
  events: {
    "Load If Needed": emptyProps(),
    Load: emptyProps(),
    "Load Success": props<{ supervisors: UserSupervisor[] }>(),
    "Load Failure": props<{ error: string }>(),
    "Update One": props<{ supervisor: UserSupervisor }>(),
    Reset: emptyProps(),
  },
});
