import * as ExcelJS from "exceljs";
import { UsagersImportRow } from "../model";
import { format } from "date-fns";

export const usagersImportExcelParser = {
  parseFileSync,
};

async function parseFileSync(filePath: string): Promise<
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
    // Colonne téléphone potentiellement au format Number
    return xlCell.fullAddress.col === 8 ? "0" + rawValue.toString() : rawValue;
  }

  if (rawValue instanceof Date) {
    return format(rawValue, "dd/MM/yyyy");
  }

  if (typeof rawValue === "string") {
    return cleanString(rawValue);
  }

  if (xlCell.type === ExcelJS.ValueType.Formula) {
    return cleanString(xlCell.result?.toString());
  }

  // Les emails peuvent avoir 2 formats différents sur Excel
  if (
    xlCell.type === ExcelJS.ValueType.Hyperlink ||
    xlCell.type === ExcelJS.ValueType.RichText
  ) {
    const parsedText: ExcelJS.CellRichTextValue = JSON.parse(
      JSON.stringify(xlCell.text)
    );

    return parsedText?.richText
      ? cleanString(parsedText?.richText[0].text)
      : cleanString(xlCell.text);
  }

  return cleanString(xlCell.toString());
}

function cleanString(str: string): string {
  if (!str?.trim().length) {
    return undefined;
  }

  return str?.trim();
}
