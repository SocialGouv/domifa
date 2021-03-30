import { StructureCommon } from "../structure/StructureCommon.type";
import { AppEntity } from "../_core/AppEntity.type";
import { AppUserMails } from "./AppUserMails.type";
import { UserRole } from "./UserRole.type";

export type AppUser = AppEntity & {
  id: number;

  prenom: string;
  nom: string;
  fonction?: string;
  structureId: number;

  // login tokens
  email: string;
  password: string;

  lastLogin: Date;
  passwordLastUpdate: Date;

  verified: boolean;

  role: UserRole; // security profile

  mail: AppUserMails;

  structure?: StructureCommon;
};
