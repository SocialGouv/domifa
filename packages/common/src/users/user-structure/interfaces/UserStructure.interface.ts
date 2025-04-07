import { type StructureCommon } from "../../../structure";
import { CommonUser } from "../../common-user/interfaces/common-user.interface";
import { type UserStructureRole } from "../types";
import { type UserStructureMails } from "./UserStructureMails.interface";

export type UserStructure = CommonUser & {
  structureId: number | null;

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
};
