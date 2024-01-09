import {
  UserStructureRole,
  UserStructureMails,
  StructureCommon,
  AppEntity,
} from "@domifa/common";

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
  acceptTerms: Date | null;
  structure?: StructureCommon;
};
