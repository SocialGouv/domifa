import { type StructureCommon } from "../../../structure";
import { CommonUser } from "../../common-user/interfaces/common-user.interface";
import {
  type UserStructureEmailStatus,
  type UserStructureRole,
} from "../types";
import { type UserStructureDecision } from "./UserStructureDecision.interface";
import { type UserStructureMails } from "./UserStructureMails.interface";

export type UserStructure = CommonUser & {
  structureId: number | null;

  lastLogin: Date | null;
  passwordLastUpdate: Date | null;

  role: UserStructureRole | null; // security profile

  emailStatus: UserStructureEmailStatus | null;

  mails: UserStructureMails;
  structure?: StructureCommon;
  acceptTerms: Date | null;

  decision?: UserStructureDecision | null;

  // frontend only
  domifaVersion?: string;
  access_token?: string;

  // Admin support-mode read-only impersonation — decoded from the JWT by
  // userStructureBuilder, read by the yellow banner + write-blocking guard
  // in packages/frontend.
  supportMode?: true;
  supportSessionUuid?: string;
  supervisorEmail?: string;
  supportModeExpiresAt?: string;
};
