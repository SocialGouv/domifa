import { UsagerLight } from "../../../_common/model";
import { Interaction } from "../../modules/usagers/interfaces/interaction";

export type AppStoreModel = {
  allUsagers: UsagerLight[];
  usagersByRefMap: { [usagerRef: string]: UsagerLight };
  interactionsByRefMap: { [usagerRef: string]: Interaction[] };
};
