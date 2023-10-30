import { MessageSmsId } from "@domifa/common";
import {
  MessageSmsInteractionMetas,
  MessageSmsReminderMetas,
  MessageSmsStatus,
} from ".";
import { AppEntity } from "../../../_common/model";

export type MessageSms = AppEntity & {
  // Infos sur l'usager
  usagerRef: number;
  structureId: number;

  content: string;

  smsId: MessageSmsId;
  status?: MessageSmsStatus;
  responseId?: string;

  scheduledDate: Date; // Date d'envoi PRÉVUE
  sendDate?: Date; // Date d'envoi EFFECTIVE

  // Metas selon le contexte
  interactionMetas?: MessageSmsInteractionMetas;
  reminderMetas?: MessageSmsReminderMetas;

  phoneNumber: string;
  senderName: string;

  lastUpdate?: Date;

  errorCount: number;
  errorMessage?: string;
};
