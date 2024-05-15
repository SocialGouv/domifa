import { type AppEntity } from "../../_core";
import { type StructureCommon } from "../../structure";
import { type UserRightStatus, type UserStructureRole } from "../types";
import { type UserStructureMails } from "./UserStructureMails.interface";

export type UserStructure = AppEntity & {
  id: number | null;
  uuid?: string | null;

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

  mails: UserStructureMails;
  structure?: StructureCommon;
  acceptTerms: Date | null;

  // frontend only
  domifaVersion?: string;
  access_token?: string;

  userRightStatus: UserRightStatus;
  territories?: string[];
};
