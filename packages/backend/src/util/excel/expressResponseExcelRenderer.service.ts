import { Workbook } from "exceljs";
import { ExpressResponse } from "../express";
import { appLogger } from "../logs";

export const expressResponseExcelRenderer = { sendExcelWorkbook };

async function sendExcelWorkbook({
  res,
  fileName,
  workbook,
}: {
  res: ExpressResponse;
  fileName: string;
  workbook: Workbook;
}) {
  try {
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200);
    res.send(buffer);
    res.end();
  } catch (err) {
    appLogger.error("Unexpected export error", err);
    res.sendStatus(500);
    res.end();
  }
}
