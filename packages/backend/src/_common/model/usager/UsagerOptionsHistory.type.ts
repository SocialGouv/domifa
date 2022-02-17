import { AppEntity } from "./../_core/AppEntity.type";
import { UsagerOptionsHistoryAction } from "./UsagerOptionsHistoryAction.type";
import { UsagerOptionsHistoryType } from "./UsagerOptionsHistoryType.type";

export type UsagerOptionsHistory = AppEntity & {
  userId: number;
  structureId: number;
  action: UsagerOptionsHistoryAction;
  type: UsagerOptionsHistoryType;
  date: Date;
  nom: string;
  prenom: string;
  adresse?: string;
  actif: boolean;
  dateDebut?: Date;
  dateFin?: Date;
  dateNaissance?: Date;
};
