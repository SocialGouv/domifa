import {
  MessageSmsId,
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

  scheduledDate: Date;
  sendDate: Date; // Date d'envoi

  // Metas selon le contexte
  interactionMetas?: MessageSmsInteractionMetas;
  reminderMetas?: MessageSmsReminderMetas;

  lastUpdate?: Date;

  errorCount?: number;
  errorMessage?: string;
};
