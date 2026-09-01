import { StructureCommon } from "@domifa/common";
import { UserAuthenticated } from "../common-user/UserAuthenticated.type";
import { UserStructurePublic } from "./UserStructurePublic.type";

export type UserStructureAuthenticated = UserAuthenticated<"structure"> &
  UserStructurePublic & {
    structure: StructureCommon;
    // Only set when role === "support": the active attachment's expiry,
    // resolved by StructuresAuthService.findAuthUser on every request.
    supportAttachmentExpiresAt?: Date;
  };
