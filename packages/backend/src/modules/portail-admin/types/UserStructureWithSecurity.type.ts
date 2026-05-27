import { UserStructure } from "@domifa/common";
import { UserTokens } from "../../../_common/model";

export type UserStructureWithSecurity = UserStructure & {
  temporaryTokens: UserTokens;
  remainingBackoffMinutes?: number | null;
};
