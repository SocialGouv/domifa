import { UsagerLight } from "../../../_common/model";

export interface SearchPageLoadedUsagersData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  usagersNonRadies: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  usagersRadiesFirsts: any[];
  usagersRadiesTotalCount: number;
  dataLoaded: boolean;
}

export type AppStoreModel = {
  searchPageLoadedUsagersData?: SearchPageLoadedUsagersData;
  usagersByRefMap: { [usagerRef: string]: UsagerLight };
};
