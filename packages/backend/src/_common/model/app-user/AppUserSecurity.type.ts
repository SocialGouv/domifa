import { AppEntity } from "../_core/AppEntity.type";
import { AppUserSecurityEvent } from "./AppUserSecurityEvent.type";
import { AppUserTokens } from "./AppUserTokens.type";

export type AppUserSecurity = AppEntity & {
  userId: number;
  structureId: number;

  temporaryTokens: AppUserTokens; // used on creation & reset password

  eventsHistory: AppUserSecurityEvent[];
};
