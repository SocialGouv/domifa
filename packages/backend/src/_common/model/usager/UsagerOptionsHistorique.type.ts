import { UsagerOptionsHistoryAction } from "./UsagerOptionsHistoryAction.type";
import { UsagerOptionsHistoriqueContent } from "./UsagerOptionsHistoriqueContent.type";

export type UsagerOptionsHistorique = {
  user: string;
  date: Date;
  action: UsagerOptionsHistoryAction;
  content: UsagerOptionsHistoriqueContent;
};
