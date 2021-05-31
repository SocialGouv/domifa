import { Workbook } from "exceljs";
import * as path from "path";
import { appLogger } from "../../util";
import { StructureUsagersExportModel } from "./StructureUsagersExportModel.type";
import {
  exportListeCourriersWorksheetRenderer,
  exportListeEntretiensWorksheetRenderer,
  exportListeParticipantsWorksheetRenderer,
} from "./worksheet-renderer";

export const structureUsagersExporter = {
  generateExcelDocument,
};
const EXCEL_TEMPLATE_FILE_PATH = path.join(
  __dirname,
  "../_templates/export-structure-usagers.xlsx"
);

async function generateExcelDocument(
  model: StructureUsagersExportModel
): Promise<Workbook> {
  try {
    const beginDate = new Date();
    const workbook = await renderWorkbook(model);
    const endDate = new Date();
    appLogger.debug(
      `[structureUsagersExporter] SUCCESS - Report created - duration: ${
        endDate.getTime() - beginDate.getTime()
      }ms`
    );
    return workbook;
  } catch (err) {
    appLogger.warn(
      `[structureUsagersExporter] ERROR - Report NOT created: ${err.message}`,
      {
        sentryBreadcrumb: true,
      }
    );
    appLogger.error("[structureUsagersExporter] ERROR - Report NOT created");
    throw err;
  }
}

async function renderWorkbook(model: StructureUsagersExportModel) {
  const workbook = new Workbook();
  await workbook.xlsx.readFile(EXCEL_TEMPLATE_FILE_PATH);
  exportListeParticipantsWorksheetRenderer.renderWorksheet({
    model,
    workbook,
    worksheetIndex: 0,
  });
  exportListeEntretiensWorksheetRenderer.renderWorksheet({
    model,
    workbook,
    worksheetIndex: 1,
  });
  exportListeCourriersWorksheetRenderer.renderWorksheet({
    model,
    workbook,
    worksheetIndex: 2,
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
