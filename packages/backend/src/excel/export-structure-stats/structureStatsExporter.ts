import { Workbook } from "exceljs";
import { join } from "path";

import { appLogger } from "../../util";
import { StructureStatsExportModel } from "./StructureStatsExportModel.type";
import { exportStructureStatsWorksheetRenderer } from "./worksheet-renderer";

const EXCEL_TEMPLATE_FILE_PATH = join(
  __dirname,
  "../_templates/export-structure-stats.xlsx"
);

export const structureStatsExporter = {
  generateExcelDocument,
};
async function generateExcelDocument(
  model: StructureStatsExportModel
): Promise<Workbook> {
  try {
    const beginDate = new Date();
    const workbook = await renderWorkbook(model);
    const endDate = new Date();
    appLogger.debug(
      `[structureStatsExporter] SUCCESS - Report created - duration: ${
        endDate.getTime() - beginDate.getTime()
      }ms`
    );
    return workbook;
  } catch (err: any) {
    appLogger.error(
      `[structureStatsExporter] ERROR - Report NOT created: ${err.message}`,
      {
        sentry: true,
        error: err,
        context: { message: err.message },
      }
    );
    throw err;
  }
}

async function renderWorkbook(model: StructureStatsExportModel) {
  const workbook = new Workbook();
  await workbook.xlsx.readFile(EXCEL_TEMPLATE_FILE_PATH);
  exportStructureStatsWorksheetRenderer.renderWorksheet({
    model,
    workbook,
    worksheetIndex: 0,
  });

  // set focus to first tab
  workbook.views = [
    {
      activeTab: 0,
      firstSheet: 0,
      height: 20000,
      visibility: "visible",
      width: 10000,
      x: 0,
      y: 0,
    },
  ];
  return workbook;
}
