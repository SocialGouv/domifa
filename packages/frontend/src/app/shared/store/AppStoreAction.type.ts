import { UsagerLight } from "../../../_common/model";
import { Interaction } from "../../modules/usager-shared/interfaces";
import { SearchPageLoadedUsagersData } from "./AppStoreModel.type";

export type AppStoreAction =
  | {
      type: "set-search-page-usagers";
      searchPageLoadedUsagersData: SearchPageLoadedUsagersData;
    }
  | {
      type: "update-usager";
      usager: UsagerLight;
    }
  | {
      type: "update-usager-interactions";
      usagerRef: number;
      interactions: Interaction[];
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
