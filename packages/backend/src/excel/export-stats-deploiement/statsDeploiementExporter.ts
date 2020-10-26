import { Workbook } from "exceljs";
import * as path from "path";
import { appLogger } from "../../util";
import { StatsDeploiementExportModel } from "./StatsDeploiementExportModel.type";
import { StatsExportUser } from "./StatsExportUser.type";
import { exportListeStructuresWorksheetRenderer } from "./worksheet-renderer";
import { exportListeUsersWorksheetRenderer } from "./worksheet-renderer/exportListeUsersWorksheetRenderer";
import { exportStatsGlobalesWorksheetRenderer } from "./worksheet-renderer/exportStatsGlobalesWorksheetRenderer";

export const statsDeploiementExporter = {
  generateExcelDocument,
};
const EXCEL_TEMPLATE_FILE_PATH = path.join(
  __dirname,
  "../_templates/export-stats-deploiement.xlsx"
);

async function generateExcelDocument({
  stats,
  users,
}: {
    stats: StatsDeploiementExportModel;
  users: StatsExportUser[];
}): Promise<Workbook> {
  try {
    const beginDate = new Date();
    const workbook = await renderWorkbook({ stats, users });
    const endDate = new Date();
    appLogger.debug(
      `[statsDeploiementExporter] SUCCESS - Report created - duration: ${endDate.getTime() - beginDate.getTime()
      }ms`
    );
    return workbook;
  } catch (err) {
    appLogger.warn("[statsDeploiementExporter] ERROR - Report NOT created:", {
      context: err,
      sentryBreadcrumb: true,
    });
    appLogger.error("[statsDeploiementExporter] ERROR - Report NOT created");
    throw err;
  }
}

async function renderWorkbook({
  stats,
  users,
}: {
    stats: StatsDeploiementExportModel;
  users: StatsExportUser[];
}) {
  const workbook = new Workbook();
  await workbook.xlsx.readFile(EXCEL_TEMPLATE_FILE_PATH);
  exportStatsGlobalesWorksheetRenderer.renderWorksheet({
    stats,
    workbook,
    worksheetIndex: 0,
  });
  exportListeStructuresWorksheetRenderer.renderWorksheet({
    stats,
    workbook,
    worksheetIndex: 1,
  });
  exportListeUsersWorksheetRenderer.renderWorksheet({
    users,
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
