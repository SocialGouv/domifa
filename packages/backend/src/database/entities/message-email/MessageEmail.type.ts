import { Bytea } from "../../../util";
import { AppEntity } from "../../../_common/model";
import { MessageEmailContent } from "./MessageEmailContent.type";
import { MessageEmailId } from "./MessageEmailId.type";
import { MessageEmailSendDetails } from "./MessageEmailSendDetails.type";
import { MessageEmailStatus } from "./MessageEmailStatus.type";
import { MessageEmailTipimailContent } from "./MessageEmailTipimailContent.type";

export type MessageEmail = AppEntity & {
  emailId: MessageEmailId;
  status: MessageEmailStatus;
  initialScheduledDate: Date;
  nextScheduledDate: Date; // in case of error, we will re-schedule the send later
  sendDate: Date; // success sent date
  content: Omit<
    MessageEmailTipimailContent | MessageEmailContent,
    "attachments"
  >;
  errorCount: number;
  errorMessage?: string;
  sendDetails?: MessageEmailSendDetails;
  attachments: Bytea; // binary content, use hexEncoder to read/write
};
