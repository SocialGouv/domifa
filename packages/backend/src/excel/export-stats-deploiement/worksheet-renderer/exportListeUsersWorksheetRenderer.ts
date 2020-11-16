import { Column, Workbook } from "exceljs";
import { WorksheetRenderer, xlRenderer, XlRowModel } from "../../xlLib";
import { StatsExportUser } from "../StatsExportUser.type";

export const exportListeUsersWorksheetRenderer = {
  renderWorksheet,
};

function renderWorksheet({
  workbook,
  worksheetIndex,
  users,
}: {
  workbook: Workbook;
  worksheetIndex: number;
  users: StatsExportUser[];
}) {
  const worksheetRendered: WorksheetRenderer = xlRenderer.selectWorksheet(
    workbook.worksheets[worksheetIndex]
  );

  const columns: Partial<Column>[] = [
    { key: "userId" },
    { key: "nom" },
    { key: "prenom" },
    { key: "email" },
    { key: "role" },
    { key: "verified" },
    { key: "structureId" },
    { key: "structureName" },
  ];

  worksheetRendered.configureColumn(columns);

  const rows: XlRowModel[] = buildRows(users);

  rows.forEach((rowModel, i) => {
    worksheetRendered.renderRow(i + 2, rowModel, { insert: true });
  });
}

function buildRows(users: StatsExportUser[]): XlRowModel[] {
  return users.map((user) => {
    const row: XlRowModel = {
      values: {
        userId: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role:
          user.role === "simple"
            ? "instructeur"
            : user.role === "responsable"
            ? "gestionnaire"
            : user.role,
        verified: user.verified ? "Oui" : "Non",
        structureId: user.structure?.id,
        structureName: user.structure?.nom,
      },
    };
    return row;
  });
}
