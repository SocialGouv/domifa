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
  // Nested signed token (own exp 7d) that lets a subsequent login skip the
  // OTP step if presented in the next StructureLoginDto.trustToken field.
  // Bound to currentSession.uuid + salt so it's invalidated automatically
  // when the session is rotated or closed (logout, OTP re-prompt).
  trustToken?: string;
};

// Trust token payload. Lives 7 days. Signed with the same jwtSecret as the
// access JWT, but identified by sub="structure-trust" so it can never be
// mistaken for an access JWT.
export interface StructureTrustJwtPayload {
  sub: "structure-trust";
  userUuid: string;
  userId: number;
  sessionUuid: string;
  salt: string;
  fingerprintHash: string;
}

export const STRUCTURE_TRUST_JWT_SUBJECT = "structure-trust" as const;
export const STRUCTURE_TRUST_JWT_EXPIRES_IN = "7d" as const;
