import { AppEntity } from "../../../_common/model";
import { MessageEmailContent } from "./MessageEmailContent.type";
import { MessageEmailId } from "./MessageEmailId.type";
import { MessageEmailSendDetails } from "./MessageEmailSendDetails.type";
import { MessageEmailStatus } from "./MessageEmailStatus.type";

export type MessageEmail = AppEntity & {
  emailId: MessageEmailId;
  status: MessageEmailStatus;
  initialScheduledDate: Date;
  nextScheduledDate: Date; // in case of error, we will re-schedule the send later
  sendDate: Date; // success sent date
  content: MessageEmailContent;
  errorCount: number;
  errorMessage?: string;
  sendDetails?: MessageEmailSendDetails;
};
