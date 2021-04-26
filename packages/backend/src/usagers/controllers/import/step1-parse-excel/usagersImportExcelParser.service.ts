import * as ExcelJS from "exceljs";
import { CellValue } from "exceljs";
import { UsagersImportRow } from "../model";
export const usagersImportExcelParser = {
  parseFileSync,
};

async function parseFileSync(
  filePath: string
): Promise<
  {
    rowNumber: number;
    row: UsagersImportRow;
  }[]
> {
  const rows: {
    rowNumber: number;
    row: UsagersImportRow;
  }[] = [];

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  worksheet.eachRow({ includeEmpty: false }, function (xlRow, rowNumber) {
    // ignore header row
    if (rowNumber > 1) {
      const row: UsagersImportRow = [];
      xlRow.eachCell({ includeEmpty: true }, function (xlCell, cellNumber) {
        // ignore header row
        if (cellNumber < 100) {
          // parse 100 cells max
          row.push(parseValue(xlCell));
        }
      });
      rows.push({
        rowNumber,
        row,
      });
    }
  });
  // filter empty rows
  return rows.filter((r) => r.row.filter((cell) => !!cell).length);
}

function parseValue(xlCell: ExcelJS.Cell): Date | boolean | number | string {
  const rawValue: CellValue = xlCell.value;
  if (
    rawValue instanceof Date ||
    typeof rawValue === "boolean" ||
    typeof rawValue === "number"
  ) {
    return rawValue;
  }
  if (typeof rawValue === "string") {
    return cleanString(rawValue);
  }
  if (xlCell.type === ExcelJS.ValueType.Formula) {
    const result = xlCell.result;
    if (typeof result === "string") {
      return cleanString(result);
    }
    return xlCell.result;
  }
  return cleanString(xlCell.toString());
}

function cleanString(str: string): string {
  if (!str?.trim().length) {
    return undefined;
  }
  return str?.trim();
}
