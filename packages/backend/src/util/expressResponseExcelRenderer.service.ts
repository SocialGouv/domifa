import { Workbook } from "exceljs";
import { appLogger } from "./AppLogger.service";
import { ExpressResponse } from "./express";
import process from "process";

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
  // Requiring module

  // Prints the output as an object
  console.log("START - sendExcelWorkbook " + new Date());
  for (const [key, value] of Object.entries(process.memoryUsage())) {
    console.log(`Memory usage by ${key}, ${value / 1000000}MB `);
  }
  console.log(" ----");
  console.log(" ");
  res.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.header("Content-Disposition", `attachment; filename="${fileName}"`);

  await workbook.xlsx
    .write(res)
    .then(() => {
      for (const [key, value] of Object.entries(process.memoryUsage())) {
        console.log(`Memory usage by ${key}, ${value / 1000000}MB `);
      }
      console.log("END - workbook.xlsx.write(res) " + new Date());
      return res.end();
    })
    .catch((err) => {
      appLogger.error("Unexpected export error", err);
      res.sendStatus(500);
      res.end();
    });

  console.log("END - sendExcelWorkbook " + new Date());
}
