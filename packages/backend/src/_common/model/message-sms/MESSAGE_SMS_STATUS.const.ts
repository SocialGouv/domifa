import { MessageSmsStatus } from ".";

export const MESSAGE_SMS_STATUS: { [key: number]: MessageSmsStatus } = {
  0: "ON_HOLD",
  1: "SENT_AND_RECEIVED",
  2: "SENT_AND_NOT_RECEIVED",
  3: "IN_PROGRESS",
  4: "FAILURE",
  5: "EXPIRED",
  6: "DISABLED",
};
