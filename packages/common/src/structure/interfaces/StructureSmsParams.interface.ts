import { type StructureMessageSmsSchedule } from "../../message-sms";

export interface StructureSmsParams {
  enabledByDomifa: boolean;
  enabledByStructure: boolean;
  senderName: string;
  senderDetails: string;
  schedule: StructureMessageSmsSchedule;
}
