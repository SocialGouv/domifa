export type StructureSmsParams = {
  enabledByDomifa: boolean;
  enabledByStructure: boolean;
  senderName: string;
  senderDetails: string;
  dateActivation?: Date;
  dateDisabled?: Date;
};
