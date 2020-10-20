import { Column, Workbook } from "exceljs";
import { structureType } from "../../../stats/usagers.labels";
import { DEPARTEMENTS_MAP } from "../../../structures/DEPARTEMENTS_MAP.const";
import { WorksheetRenderer, xlRenderer, XlRowModel } from "../../xlLib";
import { StatsDeploiement } from "../StatsDeploiement.type";

export const exportListeStructuresWorksheetRenderer = {
  renderWorksheet,
};

function renderWorksheet({
  workbook,
  worksheetIndex,
  stats,
}: {
  workbook: Workbook;
  worksheetIndex: number;
  stats: StatsDeploiement;
}) {
  const worksheetRendered: WorksheetRenderer = xlRenderer.selectWorksheet(
    workbook.worksheets[worksheetIndex]
  );

  const columns: Partial<Column>[] = [
    { key: "id" },
    { key: "nom" },
    { key: "structureTypeLabel" },
    { key: "createdAt" },
    { key: "import" },
    { key: "importDate" },
    { key: "usagersValideCount" },
    { key: "usersCount" },
    { key: "lastLogin" },
    { key: "codePostal" },
    { key: "departementCode" },
    { key: "departementLabel" },
    { key: "regionCode" },
    { key: "regionLabel" },
    { key: "email" },
  ];

  worksheetRendered.configureColumn(columns);

  const rows: XlRowModel[] = buildRows(stats);

  rows.forEach((rowModel, i) => {
    worksheetRendered.renderRow(i + 2, rowModel, { insert: true });
  });
}

function buildRows(stats: StatsDeploiement): XlRowModel[] {
  return stats.structures.map((structure) => {
    const departement = DEPARTEMENTS_MAP[structure.departement];
    const row: XlRowModel = {
      values: {
        id: structure.id,
        nom: structure.nom,
        structureTypeLabel: structureType[structure.structureType],
        createdAt: structure.createdAt,
        import: structure.import ? "oui" : "non",
        importDate: structure.importDate,
        usagersValideCount: stats.usagersCountByStructureId[structure.id] || 0,
        usersCount: structure.users.length,
        lastLogin: structure.lastLogin,
        codePostal: structure.codePostal,
        departementCode: structure.departement,
        departementLabel: departement?.regionName,
        regionCode: structure.region,
        regionLabel: departement?.departmentName,
        email: structure.email,
      },
    };
    return row;
  });
}
