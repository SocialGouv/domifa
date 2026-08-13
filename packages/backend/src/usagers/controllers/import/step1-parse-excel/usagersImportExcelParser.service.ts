import * as ExcelJS from "exceljs";
import { UsagersImportRow } from "../model";
import { format } from "date-fns";
import { stat } from "fs-extra";
import { setImmediate as yieldToEventLoop } from "node:timers/promises";
import { appLogger } from "../../../../util";

// cells beyond this column are never read, whatever the file declares
const MAX_COLUMN_COUNT = 99;

// give the event loop a chance to breathe while parsing large files
const YIELD_EVERY_ROWS = 200;

const HEARTBEAT_INTERVAL_MS = 5000;

// nodes the import never reads, and whose parsing does not scale with the file size
const IGNORED_WORKSHEET_NODES = ["dataValidations", "conditionalFormatting"];

type ImportParsingStep =
  | "read-file"
  | "collect-rows"
  | "parse-rows"
  | "filter-rows";

type ImportProcessState = {
  fileName: string;
  structureId: number;
  lastTime: number;
  lastCpuUsage: NodeJS.CpuUsage;
};

export const usagersImportExcelParser = {
  parseFile,
};

async function parseFile(
  filePath: string,
  logContext: { fileName: string; structureId: number }
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

  const { size: fileSizeBytes } = await stat(filePath);

  const processState: ImportProcessState = {
    ...logContext,
    lastTime: Date.now(),
    lastCpuUsage: process.cpuUsage(),
  };
  logProcessState("Parsing started", processState, {
    fileSizeKo: Math.round(fileSizeBytes / 1024),
  });

  const xlRows: ExcelJS.Row[] = [];
  let currentStep: ImportParsingStep = "read-file";
  const stopHeartbeat = startHeartbeat(processState, () => ({
    step: currentStep,
    collectedRowCount: xlRows.length,
    parsedRowCount: rows.length,
  }));

  try {
    const workbook = new ExcelJS.Workbook();
    // exceljs expands dataValidations cell by cell: a validation declared down to
    // the last Excel row (1048576) hangs the event loop for millions of iterations
    await workbook.xlsx.readFile(filePath, {
      ignoreNodes: IGNORED_WORKSHEET_NODES,
    });
    const worksheet = workbook.worksheets[0];

    logProcessState("Workbook loaded", processState, {
      worksheetCount: workbook.worksheets.length,
      // last declared row: way above the number of filled rows on bloated files
      declaredRowCount: worksheet?.rowCount ?? null,
      declaredColumnCount: worksheet?.columnCount ?? null,
    });

    currentStep = "collect-rows";
    worksheet.eachRow({ includeEmpty: false }, (xlRow) => {
      xlRows.push(xlRow);
    });

    logProcessState("Rows collected", processState, {
      collectedRowCount: xlRows.length,
    });

    currentStep = "parse-rows";
    let widestRowCellCount = 0;
    let readCellCount = 0;
    let ignoredCellCount = 0;

    for (const xlRow of xlRows) {
      const rowCellCount = xlRow.cellCount;
      if (rowCellCount > widestRowCellCount) {
        widestRowCellCount = rowCellCount;
      }
      ignoredCellCount += Math.max(0, rowCellCount - MAX_COLUMN_COUNT);

      // ignore header row
      if (xlRow.number > 1) {
        const columnCount = Math.min(rowCellCount, MAX_COLUMN_COUNT);
        readCellCount += columnCount;

        const row: UsagersImportRow = [];
        for (
          let columnNumber = 1;
          columnNumber <= columnCount;
          columnNumber++
        ) {
          row.push(parseValue(xlRow.getCell(columnNumber)));
        }
        rows.push({
          rowNumber: xlRow.number,
          row,
        });
      }

      if (rows.length % YIELD_EVERY_ROWS === 0) {
        await yieldToEventLoop();
      }
    }

    currentStep = "filter-rows";
    // filter empty rows
    const parsedRows = rows.filter((r) => r.row.some((cell) => !!cell));

    logProcessState("Parsing done", processState, {
      readRowCount: xlRows.length,
      parsedRowCount: parsedRows.length,
      widestRowCellCount,
      readCellCount,
      ignoredCellCount,
    });

    return parsedRows;
  } finally {
    stopHeartbeat();
  }
}

function startHeartbeat(
  processState: ImportProcessState,
  getProgress: () => Record<string, number | string>
): () => void {
  const startTime = Date.now();
  let beatCount = 0;

  const timer = setInterval(() => {
    beatCount++;
    const memoryUsage = process.memoryUsage();

    appLogger.warn(`[IMPORT] Parsing in progress`, {
      context: {
        fileName: processState.fileName,
        structureId: processState.structureId,
        ...getProgress(),
        beatCount,
        elapsedMs: Date.now() - startTime,
        memoryMo: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMo: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
    });
  }, HEARTBEAT_INTERVAL_MS);
  timer.unref();

  return () => {
    clearInterval(timer);

    if (beatCount > 0) {
      appLogger.warn(`[IMPORT] Slow parsing`, {
        context: {
          fileName: processState.fileName,
          structureId: processState.structureId,
          ...getProgress(),
          elapsedMs: Date.now() - startTime,
        },
      });
    }
  };
}

function logProcessState(
  label: string,
  processState: ImportProcessState,
  context: Record<string, number | null>
): void {
  const currentTime = Date.now();
  const currentCpuUsage = process.cpuUsage();
  const memoryUsage = process.memoryUsage();

  const durationMs = currentTime - processState.lastTime;
  // elapsed time in microseconds, to compare with the cpu usage
  const elapsedTime = durationMs * 1000;

  appLogger.info(`[IMPORT] ${label}`, {
    context: {
      fileName: processState.fileName,
      structureId: processState.structureId,
      ...context,
      durationMs,
      memoryMo: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsedMo: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      cpuUserPercent: toCpuPercent(
        currentCpuUsage.user - processState.lastCpuUsage.user,
        elapsedTime
      ),
      cpuSystemPercent: toCpuPercent(
        currentCpuUsage.system - processState.lastCpuUsage.system,
        elapsedTime
      ),
    },
  });

  processState.lastTime = currentTime;
  processState.lastCpuUsage = currentCpuUsage;
}

function toCpuPercent(cpuTime: number, elapsedTime: number): number | null {
  if (elapsedTime <= 0) {
    return null;
  }

  return Math.round((cpuTime / elapsedTime) * 100);
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
    const parsedText: ExcelJS.CellRichTextValue = xlCell.text
      ? JSON.parse(JSON.stringify(xlCell.text))
      : "";

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
