import { AppEntity } from "../../_common/model";
import { MessageEmailAttachment } from "../../database";

export type ContactSupport = AppEntity & {
  userId?: number;
  structureId?: number;
  content: string;
  attachment?: MessageEmailAttachment;
  subject?: string;
  email: string;
  name: string; // Nom de l'interlocuteur
  phone?: string;
  structureName: string; // Nom de la structure
};
