import { AppEntity } from "@domifa/common";
import { UserSecurityEvent } from "./UserSecurityEvent.interface";
import { UserTokens } from "./UserTokens.interface";

export interface UserSecurity extends AppEntity {
  userId: number;
  temporaryTokens?: UserTokens; // used on creation & reset password
  eventsHistory: UserSecurityEvent[];
  structureId?: number;
}
