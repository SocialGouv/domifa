import { UserSecurityEventType } from "./UserSecurityEventType.type";

export interface UserSecurityEvent {
  type: UserSecurityEventType;
  date: Date;
}
