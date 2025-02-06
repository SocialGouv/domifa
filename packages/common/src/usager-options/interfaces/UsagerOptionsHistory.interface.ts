import { AppEntity } from "../../_core";
import { UsagerOptionsHistoryAction } from "./UsagerOptionsHistoryAction.type";
import { UsagerOptionsHistoryType } from "./UsagerOptionsHistoryType.type";

export interface UsagerOptionsHistory extends AppEntity {
  usagerUUID: string;
  userId: number;
  userName: string;
  structureId: number;
  action: UsagerOptionsHistoryAction;
  type: UsagerOptionsHistoryType;
  nom: string;
  prenom?: string;
  adresse?: string;
  actif: boolean;
  dateDebut: Date;
  dateFin: Date;
  dateNaissance?: Date;
}
