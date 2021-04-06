import * as Joi from "joi";

export const UsagersImportCiviliteSchema = Joi.string()
  .lowercase()
  .valid("h", "f")
  .label("UsagersImportCivilite")
  .description("civilite of usager");
