import { UsagerLight } from "../../../_common/model";

export type SearchPageLoadedUsagersData = {
  usagersNonRadies: UsagerLight[];
  usagersRadiesFirsts: UsagerLight[];
  usagersRadiesTotalCount: number;
};

export type AppStoreModel = {
  searchPageLoadedUsagersData?: SearchPageLoadedUsagersData;
  usagersByRefMap: { [usagerRef: string]: UsagerLight };
};
