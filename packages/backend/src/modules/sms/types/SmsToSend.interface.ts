import { MessageSms } from "@domifa/common";

export interface SmsToSend
  extends Pick<
    MessageSms,
    "content" | "phoneNumber" | "senderName" | "structureId" | "errorCount"
  > {
  uuid: string;
}
