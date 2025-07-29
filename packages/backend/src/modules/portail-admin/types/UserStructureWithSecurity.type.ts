import { UserStructure } from "@domifa/common";
import { UserSecurityEvent, UserTokens } from "../../../_common/model";

export type UserStructureWithSecurity = UserStructure & {
  temporaryTokens: UserTokens;
  eventsHistory: UserSecurityEvent[] | null;
  remainingBackoffMinutes?: number;
};
