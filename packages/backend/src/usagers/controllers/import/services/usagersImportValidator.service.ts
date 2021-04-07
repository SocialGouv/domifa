import {
  USAGERS_IMPORT_COLUMNS,
  USAGERS_IMPORT_COLUMNS_AYANT_DROIT,
} from "../constants";
import { UsagersImportError, UsagersImportRow } from "../model";
import { UsagersImportUsagerSchemaContext } from "../schema";
import {
  UsagersImportUsager,
  UsagersImportUsagerSchema,
} from "../schema/UsagersImportUsagerSchema.yup";
import { usagersImportErrorBuilder } from "./usagersImportErrorBuilder.service";

export const usagersImportValidator = {
  parseAndValidate,
};

async function parseAndValidate({
  rowNumber,
  row,
  context,
}: {
  rowNumber: number;
  row: UsagersImportRow;
  context: UsagersImportUsagerSchemaContext;
}): Promise<{
  errors: UsagersImportError[];
  usagerRow?: UsagersImportUsager;
}> {
  try {
    const rowAsObject: any = Object.keys(USAGERS_IMPORT_COLUMNS).reduce(
      (acc, key) => {
        const rawValue = row[USAGERS_IMPORT_COLUMNS[key].index];

        acc[key] = rawValue;
        return acc;
      },
      {}
    );

    rowAsObject.ayantsDroits = [];

    for (const indexAyantDroit of USAGERS_IMPORT_COLUMNS_AYANT_DROIT) {
      const nom = row[indexAyantDroit];
      const prenom = row[indexAyantDroit + 1];
      const dateNaissance = row[indexAyantDroit + 2];
      const lienParente = row[indexAyantDroit + 3];

      if (nom || prenom || dateNaissance || lienParente) {
        rowAsObject.ayantsDroits.push({
          nom,
          prenom,
          dateNaissance,
          lienParente,
        });
      }
    }

    const ayantsDroitsStartIndex = USAGERS_IMPORT_COLUMNS.commentaires.index;
    ayantsDroitsStartIndex;

    const usagerRow: UsagersImportUsager = await UsagersImportUsagerSchema.validate(
      rowAsObject,
      {
        context,
        abortEarly: false,
      }
    );
    return { errors: [], usagerRow };
  } catch (err) {
    const errors = usagersImportErrorBuilder.buildErrors({
      err,
      rowNumber,
    });
    return { errors };
  }
}
