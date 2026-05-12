import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { UsersForAdminList } from "@domifa/common";

export const UsersActions = createActionGroup({
  source: "Admin Users",
  events: {
    Load: emptyProps(),
    "Load Success": props<{ users: UsersForAdminList[] }>(),
    "Load Failure": props<{ error: string }>(),
    "Reset Password": props<{ email: string; userId: number }>(),
    "Reset Password Success": props<{ userId: number }>(),
    "Reset Password Failure": props<{ error: string }>(),
    "Elevate Role": props<{ uuid: string }>(),
    "Elevate Role Success": props<{ uuid: string }>(),
    "Elevate Role Failure": props<{ error: string }>(),
    "Unblock User": props<{ structureId: number; userId: number }>(),
    "Unblock User Success": props<{ userId: number }>(),
    "Unblock User Failure": props<{ error: string }>(),
    "Block User": props<{ structureId: number; userId: number }>(),
    "Block User Success": props<{ userId: number }>(),
    "Block User Failure": props<{ error: string }>(),
    Reset: emptyProps(),
  },
});
