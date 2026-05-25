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
    "Unblock User": props<{ structureUuid: string; userUuid: string }>(),
    "Unblock User Success": props<{ userUuid: string }>(),
    "Unblock User Failure": props<{ error: string }>(),
    "Block User": props<{ structureUuid: string; userUuid: string }>(),
    "Block User Success": props<{ userUuid: string }>(),
    "Block User Failure": props<{ error: string }>(),
    Reset: emptyProps(),
  },
});
