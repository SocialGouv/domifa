import { AppEntity } from "@domifa/common";
import { UserSecurityEvent } from "./UserSecurityEvent.interface";
import { UserTokens } from "./UserTokens.type";

export interface UserSecurity extends AppEntity {
  userId: number;
  temporaryTokens: UserTokens; // used on creation & reset password
  eventsHistory: UserSecurityEvent[];
}
