import { ContactCategorie } from "./ContactCategory.type";
import { ContactStatus } from "./ContactStatus.type";
import { AppEntity } from "..";

export type ContactSupport = AppEntity & {
  userId?: number;
  structureId?: number;
  content: string;
  comments?: string; // Commentaire sur le ticket écrit par les admins
  file?: string;
  status: ContactStatus;
  category?: ContactCategorie;
  email: string;
  name: string; // Nom de la structure ou de l'interlocuteur
};
