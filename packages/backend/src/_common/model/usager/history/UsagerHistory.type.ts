import { AppEntity } from "../../_core/AppEntity.type";
import { UsagerDecision } from "../UsagerDecision.type";
import { UsagerHistoryImport } from "./UsagerHistoryImport.type";
import { UsagerHistoryState } from "./UsagerHistoryState.type";

export type UsagerHistory = AppEntity & {
  usagerUUID: string; // unique
  usagerRef: number; // unique par structure
  structureId: number;

  import?: UsagerHistoryImport;
  // ces objets sont stockées au moment de leur créations, jamais modifiés par la suite (on stocke une nouvelle version)
  // sauf en cas de suppression de la dernière décision (en cas de renouvellement annulé???)
  states: UsagerHistoryState[];
  decisions: UsagerDecision[];
};
