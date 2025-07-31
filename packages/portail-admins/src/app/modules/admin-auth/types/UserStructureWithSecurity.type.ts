import { UserStructure } from "@domifa/common";
import { UserSecurityEventType } from "../../shared/types/UserSecurityEvent.type";

export type UserStructureWithSecurity = UserStructure & {
  remainingBackoffMinutes: number | null;
} & {
  temporaryTokens: {
    type?: string;
    token?: string;
    validity?: Date;
  };
  eventsHistory: {
    type: UserSecurityEventType;
    date: Date;
    eventLevel: string;
  }[];
};
