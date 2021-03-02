import { AppEntity } from "../../../_common/model";
import { MessageSmsId } from "./MessageSmsId.type";
import { MessageSmsStatus } from "./MessageSmsStatus.type";
import { MessageStatusUpdate } from "./MessageStatusUpdate.type";

export type MessageSms = AppEntity & {
  // Infos sur l'usager
  usagerRef: number;
  structureId: number;

  content: string;

  smsId: MessageSmsId;
  status: MessageSmsStatus;

  scheduledDate: Date;
  sendDate: Date; // Date d'envoi

  lastUpdate: Date;
  statusUpdates: MessageStatusUpdate[];

  //
  errorCount: number;
  errorMessage?: string;
  // sendDetails?: MessageEmailSendDetails;
};
