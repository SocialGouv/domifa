import {
  ImportPreviewColumn,
  ImportPreviewRow,
  UsagersImportMode,
} from "@domifa/common";
import { UsagersImportError } from "./model";
import { usagersImportExcelParser } from "./step1-parse-excel";
import {
  UsagersImportUsager,
  UsagersImportUsagerSchemaContext,
  usagersImportValidator,
} from "./step2-validate-row";

// Parse (ExcelJS) + validation (yup) ligne à ligne. Extrait tel quel du
// contrôleur, à une exception près : le nombre de lignes est BORNÉ. C'est du
// CPU pur, sans base ni DI Nest — donc exécutable dans un worker thread, ce
// qui empêche un fichier pathologique (bombe de décompression xlsx, plage de
// colonnes dégénérée) de bloquer l'event loop du pod. Un `import/preview` de
// ce genre a gelé la prod le 11/08.
//
// Un simple timeout sur ce code, s'il tournait sur le thread principal, serait
// inutile : le blocage est synchrone, le callback du timeout ne se déclenche
// jamais tant que l'event loop est figé. L'isolation en worker est ce qui rend
// le timeout (posé par l'appelant) efficace.

export const IMPORT_MAX_ROWS = 100000;

export type ImportRowTooManyError = "IMPORT_TOO_MANY_ROWS";

export type ImportParseAndValidateResult = {
  // nombre de lignes non vides lues dans le fichier (avant filtrage), pour
  // l'observabilité — l'ancien contrôleur traçait ce compte.
  totalRows: number;
  totalCount: number;
  importErrors: UsagersImportError[];
  importPreviewRows: ImportPreviewRow[];
  // dossiers valides à créer (mode "confirm")
  usagersRows: UsagersImportUsager[];
  // dossiers valides retenus pour l'aperçu (statutDom VALIDE)
  previewUsagersRow: UsagersImportUsager[];
};

export async function parseAndValidateImportFile({
  filePath,
  importMode,
  context,
  maxErrors,
  maxRows = IMPORT_MAX_ROWS,
  logContext,
}: {
  filePath: string;
  importMode: UsagersImportMode;
  context: UsagersImportUsagerSchemaContext;
  maxErrors: number;
  maxRows?: number;
  logContext: { fileName: string; structureId: number };
}): Promise<ImportParseAndValidateResult> {
  const usagerImportRows = await usagersImportExcelParser.parseFile(
    filePath,
    logContext
  );

  if (usagerImportRows.length > maxRows) {
    // Un vrai gros import (la plus grosse structure ≈ 49 000 dossiers) reste
    // sous la borne ; au-delà, on refuse explicitement plutôt que de risquer
    // de saturer un cœur. Erreur remontée telle quelle par l'appelant.
    const error: Error & { code?: ImportRowTooManyError } = new Error(
      `Import file has ${usagerImportRows.length} rows, over the ${maxRows} limit`
    );
    error.code = "IMPORT_TOO_MANY_ROWS";
    throw error;
  }

  let importErrors: UsagersImportError[] = [];
  const importPreviewRows: ImportPreviewRow[] = [];
  const usagersRows: UsagersImportUsager[] = [];
  const previewUsagersRow: UsagersImportUsager[] = [];

  for (
    let rowIndex = 0, len = usagerImportRows.length;
    rowIndex < len && importErrors.length < maxErrors;
    rowIndex++
  ) {
    const { row, rowNumber } = usagerImportRows[rowIndex];

    const { usagerRow, errors } = await usagersImportValidator.parseAndValidate(
      {
        row,
        rowNumber,
        context,
      }
    );

    if (errors.length || importMode === "preview") {
      importErrors = importErrors.concat(errors);
      if (usagerRow && usagerRow.statutDom === "VALIDE") {
        previewUsagersRow.push(usagerRow);
      }
      importPreviewRows.push({
        isValid: errors.length === 0,
        rowNumber,
        columns: row.reduce(
          (acc, value, i) => {
            acc[i] = {
              value,
              isValid: !errors.find((err) => err.columnNumber === i + 1),
            };
            return acc;
          },
          {} as {
            [attributeName: string]: ImportPreviewColumn;
          }
        ),
        errorsCount: errors.length,
      });
    } else if (usagerRow) {
      usagersRows.push(usagerRow);
    }
  }

  return {
    totalRows: usagerImportRows.length,
    totalCount: importPreviewRows.length,
    importErrors,
    importPreviewRows,
    usagersRows,
    previewUsagersRow,
  };
}
