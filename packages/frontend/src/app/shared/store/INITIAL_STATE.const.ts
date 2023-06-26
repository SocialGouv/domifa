import { AppStoreModel } from "./AppStoreModel.type";

export const INITIAL_STATE: AppStoreModel = {
  searchPageLoadedUsagersData: {
    usagersNonRadies: [],
    usagersRadiesFirsts: [],
    usagersRadiesTotalCount: 0,
  },
  usagersByRefMap: {},
};
