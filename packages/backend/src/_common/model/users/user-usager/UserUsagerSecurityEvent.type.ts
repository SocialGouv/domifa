import { UserUsagerSecurityEventType } from "./UserUsagerSecurityEventType.type";

export type UserUsagerSecurityEvent = {
  type: UserUsagerSecurityEventType;
  date: Date;
};
