import { provideMockStore } from "@ngrx/store/testing";
import { initialUsagerState } from "../usager-actions-reducer.service";

export const NGRX_PROVIDERS_TESTING = provideMockStore({
  initialState: { usagers: initialUsagerState },
});
