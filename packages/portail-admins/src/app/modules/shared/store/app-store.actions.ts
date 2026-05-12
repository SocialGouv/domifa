import { createAction } from "@ngrx/store";

// Cross-feature action used (eg. on logout) to wipe all state.
export const resetAppState = createAction("[App] Reset");
