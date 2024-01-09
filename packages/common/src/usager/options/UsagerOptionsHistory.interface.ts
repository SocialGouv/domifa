import { type AppEntity } from "../../_core";
import { type UsagerOptionsHistoryAction } from "./UsagerOptionsHistoryAction.type";
import { type UsagerOptionsHistoryType } from "./UsagerOptionsHistoryType.type";

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
