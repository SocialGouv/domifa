import { Column, Workbook } from "exceljs";
import { structureType } from "../../../stats/usagers.labels";
import { DEPARTEMENTS_MAP } from "../../../structures/DEPARTEMENTS_MAP.const";
import {
  WorksheetRenderer,
  xlFormater,
  xlRenderer,
  XlRowModel
} from "../../xlLib";
import { StatsDeploiementExportModel } from "../StatsDeploiementExportModel.type";

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
  stats: StatsDeploiementExportModel;
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

function buildRows(stats: StatsDeploiementExportModel): XlRowModel[] {
  return stats.structures.map((model) => {
    const structure = model.structure;
    const departement = DEPARTEMENTS_MAP[structure.departement];
    const row: XlRowModel = {
      values: {
        id: structure.id,
        nom: structure.nom,
        structureTypeLabel: structureType[structure.structureType],
        createdAt: xlFormater.toLocalTimezone(structure.createdAt),
        import: structure.import ? "oui" : "non",
        importDate: xlFormater.toLocalTimezone(structure.importDate),
        usagersValideCount: stats.usagersCountByStructureId[structure.id] || 0,
        usersCount: model.usersCount,
        lastLogin: xlFormater.toLocalTimezone(structure.lastLogin),
        codePostal: structure.codePostal,
        departementCode: structure.departement,
        departementLabel: departement?.departmentName,
        regionCode: structure.region,
        regionLabel: departement?.regionName,
        email: structure.email,
      },
    };
    return row;
  });
}
