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
  fingerprintHash: string;
  trustToken?: string;
};

export interface StructureTrustJwtPayload {
  sub: "structure-trust";
  userUuid: string;
  userId: number;
  sessionUuid: string;
  salt: string;
  fingerprintHash: string;
}

export const STRUCTURE_TRUST_JWT_SUBJECT = "structure-trust" as const;
export const STRUCTURE_TRUST_JWT_EXPIRES_IN = "30d" as const;
