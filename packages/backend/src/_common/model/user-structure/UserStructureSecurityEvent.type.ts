import { UserStructureSecurityEventType } from "./UserStructureSecurityEventType.type";

export type UserStructureSecurityEvent = {
  type: UserStructureSecurityEventType;
  date: Date;
};
