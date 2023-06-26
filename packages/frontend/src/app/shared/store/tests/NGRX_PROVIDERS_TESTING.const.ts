import { provideMockStore } from "@ngrx/store/testing";
import { USAGER_ACTIF_MOCK } from "../../../../_common/mocks";
import { selectUsagerByRef, cacheManager } from "../ngRxUsagersCache.service";

export const NGRX_PROVIDERS_TESTING = provideMockStore({
  initialState: {
    searchPageLoadedUsagersData: {
      usagersNonRadies: [],
      usagersRadiesFirsts: [],
      usagersRadiesTotalCount: 0,
    },
    usagersByRefMap: {},
  },
  selectors: [
    {
      selector: selectUsagerByRef("X"),
      value: USAGER_ACTIF_MOCK,
    },
    {
      selector: cacheManager.getUsagersMap,
      value: {
        searchPageLoadedUsagersData: {
          usagersNonRadies: [],
          usagersRadiesFirsts: [],
          usagersRadiesTotalCount: 0,
        },
        usagersByRefMap: {},
      },
    },
  ],
});
