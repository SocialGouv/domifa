import { Workbook } from "exceljs";
import { join } from "path";

import { appLogger } from "../../util";
import {
  exportListeStructuresWorksheetRenderer,
  exportListeUsersWorksheetRenderer,
} from "./worksheet-renderer";
import {
  StructureAdminForList,
  UsersForAdminList,
} from "../../modules/portail-admin/types";

export const statsDeploiementExporter = {
  generateExcelDocument,
};
const EXCEL_TEMPLATE_FILE_PATH = join(
  __dirname,
  "../_templates/export-stats-deploiement.xlsx"
);

async function generateExcelDocument({
  structures,
  users,
}: {
  structures: StructureAdminForList[];
  users: UsersForAdminList[];
}): Promise<Workbook> {
  try {
    return renderWorkbook({ structures, users });
  } catch (err) {
    appLogger.error("[statsDeploiementExporter] ERROR - Report NOT created", {
      sentry: true,
      error: err,
    });
    throw err;
  }
}

async function renderWorkbook({
  structures,
  users,
}: {
  structures: StructureAdminForList[];
  users: UsersForAdminList[];
}) {
  const workbook = new Workbook();
  await workbook.xlsx.readFile(EXCEL_TEMPLATE_FILE_PATH);

  exportListeStructuresWorksheetRenderer.renderWorksheet({
    structures,
    workbook,
    worksheetIndex: 0,
  });
  exportListeUsersWorksheetRenderer.renderWorksheet({
    users,
    workbook,
    worksheetIndex: 1,
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
