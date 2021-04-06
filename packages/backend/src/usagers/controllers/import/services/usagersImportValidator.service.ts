import { appLogger } from "../../../../util";
import { USAGERS_IMPORT_COLUMNS } from "../constants";
import { UsagersImportError, UsagersImportRow } from "../model";
import { UsagersImportUsager } from "../schema-generated-model";
import { UsagersImportUsagerSchema } from "../schema/UsagersImportUsagerSchema.joi";

export const usagersImportValidator = {
  parseAndValidate,
};

async function parseAndValidate({
  rowIndex,
  row,
  params,
}: {
  rowIndex: number;
  row: UsagersImportRow;
  params: {
    today: Date;
  };
}): Promise<{
  errors: UsagersImportError[];
  usagerRow?: UsagersImportUsager;
}> {
  try {
    const usagerRow: UsagersImportUsager = await UsagersImportUsagerSchema.validateAsync(
      {
        params,
        row: {
          civilite: row[USAGERS_IMPORT_COLUMNS.civilite.index],
        },
      }
    );
    return { errors: [], usagerRow };
  } catch (err) {
    const errors = (err.details ?? [])
      .map((detail) => {
        const key = detail.context.key;
        const column = USAGERS_IMPORT_COLUMNS[key];
        if (!column) {
          appLogger.error(`Invalid column key ${key}`);
        } else {
          const columnIndex = column.index;
          const value = row[columnIndex];
          const error: UsagersImportError = {
            rowId: rowIndex.toString(),
            columnId: columnIndex,
            value,
            label: column.label,
          };
          return error;
        }
      })
      .filter((x) => !!x);
    return { errors };
  }
}
