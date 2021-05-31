import { Workbook } from "exceljs";
import { appLogger } from "./AppLogger.service";
import { ExpressResponse } from "./express";

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
  res.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.header("Content-Disposition", `attachment; filename="${fileName}"`);

  await workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {
      appLogger.error("Unexpected export error", err);
      res.sendStatus(500);
      res.end();
    });
}
