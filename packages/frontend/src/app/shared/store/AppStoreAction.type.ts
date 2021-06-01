import { UsagerLight } from "../../../_common/model";

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
      type: "delete-usager";
      criteria: Partial<UsagerLight>;
    }
  | {
      type: "add-usager";
      usager: UsagerLight;
    };
