import { AppEntity } from "../_core/AppEntity.type";
import { UserStructureSecurityEvent } from "./UserStructureSecurityEvent.type";
import { UserStructureTokens } from "./UserStructureTokens.type";

export type UserStructureSecurity = AppEntity & {
  userId: number;
  structureId: number;

  temporaryTokens: UserStructureTokens; // used on creation & reset password

  eventsHistory: UserStructureSecurityEvent[];
};
