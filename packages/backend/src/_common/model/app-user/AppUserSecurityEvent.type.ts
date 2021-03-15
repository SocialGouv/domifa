import { AppUserSecurityEventType } from "./AppUserSecurityEventType.type";

export type AppUserSecurityEvent = {
  type: AppUserSecurityEventType;
  date: Date;
};
