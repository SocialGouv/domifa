import { ValidationError } from "yup";
import { appLogger } from "../../../../util";
import {
  USAGERS_IMPORT_COLUMNS,
  USAGERS_IMPORT_COLUMNS_AYANT_DROIT,
} from "../constants";
import { UsagersImportError } from "../model";

export const usagersImportErrorBuilder = {
  buildErrors,
  _parseAyantsDroitsKey,
};

function buildErrors({
  err,
  rowNumber,
  rowAsObject,
}: {
  err: {
    inner: Pick<ValidationError, "path" | "value">[];
  };
  rowNumber: number;
  rowAsObject: any;
}) {
  const errors = (err.inner ?? []).reduce((acc, innerError) => {
    const key = innerError.path;

    const column = USAGERS_IMPORT_COLUMNS[key];
    if (!column) {
      if (key.indexOf("ayantsDroits") === 0) {
        // e.g. "ayantsDroits[0].prenom"
        const {
          columnNumber,
          ayantDroitIndex,
          columnAttributeLabel,
        } = _parseAyantsDroitsKey(key);
        addError({
          acc,
          rowNumber,
          columnNumber,
          value: rowAsObject[innerError.path],
          label: `${columnAttributeLabel} Ayant-Droit ${ayantDroitIndex + 1}`,
          details: innerError,
        });
      } else {
        appLogger.error(`Invalid column key "${key}" (USAGERS_IMPORT_COLUMNS)`);
      }
      return acc;
    } else {
      const columnNumber = column.index + 1;
      addError({
        acc,
        rowNumber,
        columnNumber,
        value: rowAsObject[innerError.path],
        label: column.label,
        details: innerError,
      });
      return acc;
    }
  }, [] as UsagersImportError[]);
  if (errors.length === 0) {
    appLogger.error("Unexpected error while importing usagers", {
      sentry: true,
      error: err as any,
    });
    errors.push({
      columnNumber: -1,
      rowNumber: -1,
      label: "Unexpected error",
      value: undefined,
    });
  }
  return errors;
}
function _parseAyantsDroitsKey(
  key: string
): {
  columnNumber: number;
  ayantDroitIndex: number;
  columnAttributeLabel: string;
} {
  // e.g. "ayantsDroits[0].prenom"
  const chunks = key.split(".");
  if (chunks.length !== 2) {
    throw new Error(`Invalid size ${chunks.length}`);
  }
  let columnNumber = USAGERS_IMPORT_COLUMNS_AYANT_DROIT[0] + 1;
  const indexString = chunks[0].substring(
    "ayantsDroits".length + 1,
    chunks[0].length - 1
  );
  const ayantDroitIndex = parseInt(indexString, 10);
  if (isNaN(ayantDroitIndex)) {
    throw new Error(`Invalid ayantDroitIndex "${indexString}"`);
  }
  columnNumber += 4 * ayantDroitIndex;
  const attribute = chunks[1];
  let columnAttributeLabel: string;
  switch (attribute) {
    case "nom":
      columnNumber += 0;
      columnAttributeLabel = "Nom";
      break;
    case "prenom":
      columnNumber += 1;
      columnAttributeLabel = "Prénom";
      break;
    case "dateNaissance":
      columnAttributeLabel = "Date de naissance";
      columnNumber += 2;
      break;
    case "lienParente":
      columnAttributeLabel = "Lien de Parenté";
      columnNumber += 3;
      break;
    default:
      throw new Error(`Invalid attribute ${chunks[1]}`);
  }
  return { columnNumber, ayantDroitIndex, columnAttributeLabel };
}

function addError({
  acc,
  rowNumber,
  columnNumber,
  value,
  label,
  details,
}: {
  acc: UsagersImportError[];
  rowNumber: number;
  columnNumber: number;
  value: any;
  label: string;
  details: any;
}) {
  if (
    !acc.find(
      (x) => x.rowNumber === rowNumber && x.columnNumber === columnNumber
    )
  ) {
    // only add error if not already an error for this data (e.g.: email can throw multiple errors for the same data)
    const error: UsagersImportError = {
      rowNumber,
      columnNumber,
      value,
      label,
      details,
    };
    acc.push(error);
  }
}
