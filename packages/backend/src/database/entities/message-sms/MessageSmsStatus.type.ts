export type MessageSmsStatus =
  | "ON_HOLD"
  | "SENT_AND_RECEIVED"
  | "SENT_AND_NOT_RECEIVED"
  | "IN_PROGRESS"
  | "FAILURE"
  | "EXPIRED";

export const ON_HOLD = 0;
export const SENT_AND_RECEIVED = 1;
export const SENT_AND_NOT_RECEIVED = 2;
export const IN_PROGRESS = 3;
export const FAILURE = 4;
export const EXPIRED = 5;
