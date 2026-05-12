import { Column, Workbook } from "exceljs";
import { WorksheetRenderer, xlRenderer, XlRowModel } from "../../xlLib";
import { UsersForAdminList } from "@domifa/common";

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
  users: UsersForAdminList[];
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
    { key: "structureId" },
    { key: "structureName" },
    { key: "status" },
  ];

  worksheetRendered.configureColumn(columns);

  const rows: XlRowModel[] = buildRows(users);

  rows.forEach((rowModel, i) => {
    worksheetRendered.renderRow(i + 2, rowModel, { insert: true });
  });
}

function buildRows(users: UsersForAdminList[]): XlRowModel[] {
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
        structureId: user.structureId,
        structureName: user.structureName,
        status: {
          ACTIVE: "Actif",
          BLOCKED: "Bloqué",
          PENDING: "En attente",
          TEMPORARILY_BLOCKED: "Blocage temporaire",
        }[user.status],
      },
    };
    return row;
  });
}
