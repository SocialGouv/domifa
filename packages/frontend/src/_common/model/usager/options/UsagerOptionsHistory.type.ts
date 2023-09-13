import {
  AppEntity,
  UsagerOptionsHistoryAction,
  UsagerOptionsHistoryType,
} from "@domifa/common";

export type UsagerOptionsHistory = AppEntity & {
  usagerUUID: string;
  userId: number;
  createdAt: Date;
  userName: string;
  structureId: number;
  action: UsagerOptionsHistoryAction;
  type: UsagerOptionsHistoryType;
  nom: string;
  prenom?: string;
  adresse?: string;
  actif: boolean;
  dateDebut?: Date;
  dateFin?: Date;
  dateNaissance?: Date;
};
