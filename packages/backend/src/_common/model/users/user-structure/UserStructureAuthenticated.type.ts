import { StructureCommon } from "@domifa/common";
import { UserAuthenticated } from "../common-user/UserAuthenticated.type";
import { UserStructurePublic } from "./UserStructurePublic.type";

export type UserStructureAuthenticated = UserAuthenticated<"structure"> &
  UserStructurePublic & {
    structure: StructureCommon;
    // Mirrors UserStructureJwtPayload's support-mode fields, merged onto the
    // authenticated user by JwtStrategy so downstream guards/controllers can
    // read them off request.user without re-decoding the JWT.
    supportMode?: true;
    supportSessionUuid?: string;
    supervisorId?: number;
    supervisorEmail?: string;
  };
