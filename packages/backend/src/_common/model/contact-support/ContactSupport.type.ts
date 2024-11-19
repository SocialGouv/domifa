import { AppEntity } from "..";
import { MessageEmailAttachment } from "../../../database";

export type ContactSupport = AppEntity & {
  userId?: number;
  structureId?: number;
  content: string;
  attachment?: MessageEmailAttachment;
  subject?: string;
  email: string;
  name: string; // Nom de l'interlocuteur
  structureName: string; // Nom de la structure
};
