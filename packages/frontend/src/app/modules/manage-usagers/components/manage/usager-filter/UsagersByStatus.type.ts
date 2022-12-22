import { UsagerLight } from "../../../../../../_common/model";

export type UsagersByStatus = {
  INSTRUCTION: UsagerLight[];
  VALIDE: UsagerLight[];
  ATTENTE_DECISION: UsagerLight[];
  REFUS: UsagerLight[];
  RADIE: UsagerLight[];
  TOUS: UsagerLight[];
};
