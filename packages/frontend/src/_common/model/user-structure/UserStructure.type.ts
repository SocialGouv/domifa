import { StructureCommon } from "../../../app/modules/structures/types";
import { AppEntity } from "../_core/AppEntity.type";
import { UserStructureMails } from "./UserStructureMails.type";
import { UserStructureRole } from "./UserStructureRole.type";

export type UserStructure = AppEntity & {
  id: number | null;
  uuid: string | null;

  prenom: string | null;
  nom: string | null;
  fonction?: string | null;
  structureId: number | null;

  // login tokens
  email: string;
  password: string;

  lastLogin: Date | null;
  passwordLastUpdate: Date;

  verified: boolean;

  role: UserStructureRole | null; // security profile

  mail: UserStructureMails;

  structure: StructureCommon;
  acceptTerms: Date | null;
  domifaVersion: string;
  access_token?: string; // frontend only
};
