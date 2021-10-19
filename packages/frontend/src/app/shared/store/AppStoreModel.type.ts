import { UsagerLight } from "../../../_common/model";
import { Interaction } from "../../modules/usager-shared/interfaces";

export type AppStoreModel = {
  allUsagers: UsagerLight[];
  usagersByRefMap: { [usagerRef: string]: UsagerLight };
  interactionsByRefMap: { [usagerRef: string]: Interaction[] };
};
