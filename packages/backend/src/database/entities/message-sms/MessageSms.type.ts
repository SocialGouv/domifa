import { AppEntity } from "../../../_common/model";
import { MessageSmsId } from "./MessageSmsId.type";
import { MessageSmsStatus } from "./MessageSmsStatus.type";

export type MessageSms = AppEntity & {
  emailId: MessageSmsId;
  status: MessageSmsStatus;
  initialScheduledDate: Date;

  sendDate: Date; // success sent date

  errorCount: number;
  errorMessage?: string;
  // sendDetails?: MessageEmailSendDetails;
};
