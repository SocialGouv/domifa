import { StructureCommon } from "../structure/StructureCommon.type";
import { AppEntity } from "../_core/AppEntity.type";
import { UserStructureMails } from "./UserStructureMails.type";
import { UserStructureRole } from "./UserStructureRole.type";

export type UserStructure = AppEntity & {
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

  role: UserStructureRole; // security profile

  mails: UserStructureMails;

  structure?: StructureCommon;
};
