import * as fs from "fs";
import * as XLSX from "xlsx";
import { appLogger } from "../../../../util";
import { UsagersImportRow } from "../model";

export const usagersImportExcelParser = {
  parseFileSync,
};

function parseFileSync(filePath: string): UsagersImportRow[] {
  const buffer = fs.readFileSync(filePath);
  const wb = XLSX.read(buffer, {
    dateNF: "dd/mm/yyyy",
    type: "buffer",
  });

  if (!buffer) {
    appLogger.error(`[importExcelParser] Unexpected error parsing file`, {
      extra: {
        filePath,
      },
      sentry: true,
    });
    throw new Error("Unexpected error parsing file");
  } else {
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    return XLSX.utils.sheet_to_json(ws, {
      blankrows: false,
      dateNF: "dd/mm/yyyy",
      header: 1,
      raw: false,
    }) as UsagersImportRow[];
  }
}
