import { AppEntity } from "@domifa/common";

export type PortailAdminUser = AppEntity & {
  // ETAT CIVIL
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  password?: string;
  verified: boolean;
  lastLogin?: Date;
};
