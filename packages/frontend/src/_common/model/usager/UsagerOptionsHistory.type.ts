import { UsagerOptionsHistoryAction } from "./UsagerOptionsHistoryAction.type";
import { UsagerOptionsHistoryType } from "./UsagerOptionsHistoryType.type";

export type UsagerOptionsHistory = {
  usagerUUID: string;
  userId: number;
  userName: string;
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
