import * as ExcelJS from "exceljs";
import moment = require("moment");

import { UsagersImportRow } from "../model";
import { ValidationRegexp } from "../step2-validate-row";
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
  worksheet.eachRow({ includeEmpty: false }, (xlRow, rowNumber) => {
    // ignore header row
    if (rowNumber > 1) {
      const row: UsagersImportRow = [];
      xlRow.eachCell({ includeEmpty: true }, (xlCell, cellNumber) => {
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
  const rawValue: ExcelJS.CellValue = xlCell.value;
  if (typeof rawValue === "number") {
    return rawValue;
  }

  if (rawValue instanceof Date) {
    return moment(rawValue).format("DD/MM/yyyy");
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
