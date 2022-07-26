import { UsagerLight } from "../../../_common/model";
import { SearchPageLoadedUsagersData } from "./AppStoreModel.type";

export type AppStoreAction =
  | {
      type: "set-search-page-usagers";
      searchPageLoadedUsagersData: SearchPageLoadedUsagersData;
    }
  | {
      type: "update-usagers";
      usagers: UsagerLight[];
    }
  | {
      type: "update-usager";
      usager: UsagerLight;
    }
  | {
      type: "delete-usager";
      criteria: Pick<UsagerLight, "ref">;
    }
  | {
      type: "add-usager";
      usager: UsagerLight;
    }
  | {
      type: "reset";
    };
