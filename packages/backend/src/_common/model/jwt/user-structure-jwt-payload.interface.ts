import { UserFonction, UserStructureRole } from "@domifa/common";
import { UseBaseJwtPayload } from "./user-base-jwt-payload.type";

export type UserStructureJwtPayload = UseBaseJwtPayload<"structure"> & {
  email: string;
  id: number;
  nom: string;
  prenom: string;
  role: UserStructureRole;
  fonction?: UserFonction | null;
  fonctionDetail?: string;
  lastLogin: Date;
  acceptTerms: Date | null;
  structureId: number;
  domifaVersion: string;
  // Hash of (userUUID|ip|ua) captured at login. Required: any JWT without
  // this claim is rejected at validation time, forcing a re-login. In v1
  // the hash comparison itself only logs mismatches; phase 2 will block.
  fingerprintHash: string;
};
