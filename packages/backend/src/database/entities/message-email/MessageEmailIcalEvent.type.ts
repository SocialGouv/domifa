export type MessageEmailIcalEventMethod =
  // https://tools.ietf.org/html/rfc5546#page-7
  | "publish"
  | "request"
  | "reply"
  | "add"
  | "cancel"
  | "refresh"
  | "counter"
  | "declinecounter";

export type MessageEmailIcalEvent = {
  filename: string;
  content: any;
  method: MessageEmailIcalEventMethod; // NOTE: should match the METHOD: value in calendar event file
};
