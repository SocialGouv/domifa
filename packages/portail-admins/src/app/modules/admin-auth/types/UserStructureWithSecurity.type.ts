import { UserStructure } from "@domifa/common";

export type UserStructureWithSecurity = UserStructure & {
  remainingBackoffMinutes: number | null;
  temporaryTokens: {
    type?: string;
    token?: string;
    validity?: Date;
  };
};
