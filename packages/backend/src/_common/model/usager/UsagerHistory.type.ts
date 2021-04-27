import { AppEntity } from "../../../_common/model";
import { UsagerAyantDroit } from "./UsagerAyantDroit.type";
import { UsagerDecision } from "./UsagerDecision.type";
import { UsagerEntretien } from "./UsagerEntretien.type";
import { UsagerHistoryAttribute } from "./UsagerHistoryAttribute.type";

export type UsagerHistory = AppEntity & {
  usagerUUID: string; // unique
  usagerRef: number; // unique par structure
  structureId: number;

  // ces objets sont stockées au moment de leur créations, jamais modifiés par la suite (on stocke une nouvelle version)
  decisions: UsagerHistoryAttribute<UsagerDecision>[];
  ayantsDroits: UsagerHistoryAttribute<UsagerAyantDroit[]>[];
  entretiens: UsagerHistoryAttribute<UsagerEntretien>[];
};
