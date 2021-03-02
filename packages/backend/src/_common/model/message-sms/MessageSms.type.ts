import { MessageSmsId, MessageSmsStatus, MessageSmsUpdate } from ".";
import { AppEntity } from "../../../_common/model";

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
  statusUpdates: MessageSmsUpdate[];

  //
  errorCount: number;
  errorMessage?: string;
  // sendDetails?: MessageEmailSendDetails;
};
