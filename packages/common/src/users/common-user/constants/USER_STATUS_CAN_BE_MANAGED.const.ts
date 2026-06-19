import { UserStatus } from "../types/UserStatus.type";

export const USER_STATUS_CAN_BE_MANAGED: Record<UserStatus, boolean> = {
  ACTIVE: true,
  PENDING: true,
  TEMPORARILY_BLOCKED: false,
  BLOCKED: false,
  DELETE: false,
};
