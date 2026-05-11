export type UserStatus =
  | "ACTIVE"
  | "PENDING"
  | "TEMPORARILY_BLOCKED"
  | "BLOCKED";

export const USER_STATUS_VALUES: UserStatus[] = [
  "ACTIVE",
  "PENDING",
  "TEMPORARILY_BLOCKED",
  "BLOCKED",
];
