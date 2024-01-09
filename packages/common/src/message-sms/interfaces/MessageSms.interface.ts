import { type AppEntity } from "../../_core";
import { type MessageSmsId, type MessageSmsStatus } from "../types";
import { type MessageSmsInteractionMetas } from "./MessageSmsInteractionMetas.interface";
import { type MessageSmsReminderMetas } from "./MessageSmsReminderMetas.interface";

export interface MessageSms extends AppEntity {
  usagerRef: number;
  structureId: number;

  content: string;

  smsId: MessageSmsId;
  status?: MessageSmsStatus;
  responseId?: string;

  scheduledDate: Date; // Date d'envoi PRÉVUE
  sendDate?: Date; // Date d'envoi EFFECTIVE
  interactionMetas?: MessageSmsInteractionMetas;
  reminderMetas?: MessageSmsReminderMetas;

  phoneNumber: string;
  senderName: string;

  lastUpdate?: Date;

  errorCount: number;
  errorMessage?: string;
}
