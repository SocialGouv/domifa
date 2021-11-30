import { AppEntity } from "../_core";

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
