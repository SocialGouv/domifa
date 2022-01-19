import { StructureSmsParams } from "../_common/model";

type SmsDate = {
  dateActivation: Date;
  dateDisabled: Date;
};

export const strucutreSmsDateCondition = (
  structureSms: StructureSmsParams,
  structureNewSms
): SmsDate => {
  let dateActivation = null;
  let dateDisabled = null;

  if (
    (!structureSms.enabledByDomifa || !structureSms.enabledByStructure) &&
    structureNewSms.enabledByDomifa &&
    structureNewSms.enabledByStructure
  ) {
    dateActivation = new Date();
  } else if (
    (structureSms.enabledByDomifa || structureSms.enabledByStructure) &&
    (!structureNewSms.enabledByDomifa || !structureNewSms.enabledByStructure)
  ) {
    dateDisabled = new Date();
  }

  return {
    dateActivation,
    dateDisabled,
  };
};
