import { Column, Workbook } from "exceljs";

import {
  WorksheetRenderer,
  xlFormater,
  xlRenderer,
  XlRowModel,
} from "../../xlLib";
import { DEPARTEMENTS_MAP, STRUCTURE_TYPE_LABELS } from "@domifa/common";
import { StructureAdminForList } from "../../../modules/portail-admin/types";

export const exportListeStructuresWorksheetRenderer = {
  renderWorksheet,
};

function renderWorksheet({
  workbook,
  worksheetIndex,
  structures,
}: {
  workbook: Workbook;
  worksheetIndex: number;
  structures: StructureAdminForList[];
}) {
  const worksheetRendered: WorksheetRenderer = xlRenderer.selectWorksheet(
    workbook.worksheets[worksheetIndex]
  );

  const columns: Partial<Column>[] = [
    { key: "id" },
    { key: "nom" },
    { key: "structureTypeLabel" },
    { key: "registrationDate" },
    { key: "import" },
    { key: "importDate" },
    { key: "usersCount" },
    { key: "usagersAllCount" },
    { key: "lastLogin" },
    { key: "codePostal" },
    { key: "ville" },
    { key: "departementCode" },
    { key: "departementLabel" },
    { key: "regionCode" },
    { key: "regionLabel" },
    { key: "email" },
  ];

  worksheetRendered.configureColumn(columns);

  const rows: XlRowModel[] = buildRows(structures);

  rows.forEach((rowModel, i) => {
    worksheetRendered.renderRow(i + 2, rowModel, { insert: true });
  });
}

function buildRows(structures: StructureAdminForList[]): XlRowModel[] {
  return structures.map((structure) => {
    const departement = DEPARTEMENTS_MAP[structure.departement];
    const row: XlRowModel = {
      values: {
        id: structure.id,
        nom: structure.nom,
        structureTypeLabel: STRUCTURE_TYPE_LABELS[structure.structureType],
        registrationDate: xlFormater.toLocalTimezone(
          structure.registrationDate
        ),
        import: structure.import ? "oui" : "non",
        importDate: xlFormater.toLocalTimezone(structure.importDate),
        usersCount: structure.users,
        usagersAllCount: structure.usagers ?? 0,
        lastLogin: xlFormater.toLocalTimezone(structure.lastLogin),
        codePostal: structure.codePostal,
        ville: structure.ville.toUpperCase().trim(),
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
