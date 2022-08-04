import { UsagerLight } from "../../../_common/model";
import { Interaction } from "../../modules/usager-shared/interfaces";

export type SearchPageLoadedUsagersData = {
  usagersNonRadies: UsagerLight[];
  usagersRadiesFirsts: UsagerLight[];
  usagersRadiesTotalCount: number;
};

export type AppStoreModel = {
  searchPageLoadedUsagersData?: SearchPageLoadedUsagersData;
  usagersByRefMap: { [usagerRef: string]: UsagerLight };
  interactionsByRefMap: { [usagerRef: string]: Interaction[] };
};
