import { UsagerLight } from "../../../_common/model";
import { Interaction } from "../../modules/usager-shared/interfaces";

export type AppStoreAction =
  | {
      type: "set-usagers";
      usagers: UsagerLight[];
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
