import { ContactCategorie } from "./ContactCategory.type";
import { ContactStatus } from "./ContactStatus.type";
import { AppEntity } from "..";
import { MessageEmailAttachment } from "../../../database";

export type ContactSupport = AppEntity & {
  userId?: number;
  structureId?: number;
  content: string;
  comments?: string; // Commentaire sur le ticket écrit par les admins
  attachment?: MessageEmailAttachment;
  status: ContactStatus;
  category?: ContactCategorie;
  email: string;
  name: string; // Nom de l'interlocuteur
  structureName: string; // Nom de la structure
};
