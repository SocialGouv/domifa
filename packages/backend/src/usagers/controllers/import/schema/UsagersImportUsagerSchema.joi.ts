import * as Joi from "joi";
import { UsagersImportCiviliteSchema } from "./attributes/UsagersImportCiviliteSchema.joi";
import { DateFrUTCSchema } from "./core/DateFrUTCSchema.joi";

export const UsagersImportUsagerSchema = Joi.object()
  .keys({
    params: {
      today: Joi.date().required(),
    },
    data: Joi.object({
      civilite: UsagersImportCiviliteSchema.required(),
      nom: Joi.string().required(),
      prenom: Joi.string().required(),
      dateNaissance: DateFrUTCSchema({
        minDate: Joi.ref("params.today"),
      }).required(),
    }),
  })
  .label("UsagersImportUsager");
