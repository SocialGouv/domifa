import { Column, Workbook } from "exceljs";
import {
  cause,
  raison,
  residence,
  typeMenage,
} from "../../../stats/usagers.labels";
import { WorksheetRenderer, xlRenderer, XlRowModel } from "../../xlLib";
import { StructureUsagersExportModel } from "../StructureUsagersExportModel.type";

export const exportListeCourriersWorksheetRenderer = {
  renderWorksheet,
};

function renderWorksheet({
  workbook,
  worksheetIndex,
  model,
}: {
  workbook: Workbook;
  worksheetIndex: number;
  model: StructureUsagersExportModel;
}) {
  const worksheetRendered: WorksheetRenderer = xlRenderer.selectWorksheet(
    workbook.worksheets[worksheetIndex]
  );

  configureColumns();

  const rows: XlRowModel[] = buildRows(model);

  rows.forEach((rowModel, i) => {
    worksheetRendered.renderRow(i + 3, rowModel, { insert: true });
  });

  function configureColumns() {
    const columns: Partial<Column>[] = [
      { key: "customId" },
      { key: "sexe" },
      { key: "nom" },
      { key: "prenom" },
      { key: "surnom" },
      { key: "dateNaissance" },
      { key: "courrierIn" },
      { key: "courrierOut" },
      { key: "recommandeIn" },
      { key: "recommandeOut" },
      { key: "colisIn" },
      { key: "colisOut" },
      { key: "appel" },
      { key: "visite" },
    ];

    worksheetRendered.configureColumn(columns);
  }

  function buildRows(model: StructureUsagersExportModel): XlRowModel[] {
    return model.usagers.map((usager) => {
      const usagersInteractionsCounts =
        model.usagersInteractionsCountByType[usager.id];
      const row: XlRowModel = {
        values: {
          customId: usager.customId,
          sexe: usager.sexe,
          nom: usager.nom,
          prenom: usager.prenom,
          surnom: usager.surnom,
          dateNaissance: usager.dateNaissance,
          courrierIn: usagersInteractionsCounts.courrierIn,
          courrierOut: usagersInteractionsCounts.courrierOut,
          recommandeIn: usagersInteractionsCounts.recommandeIn,
          recommandeOut: usagersInteractionsCounts.recommandeOut,
          colisIn: usagersInteractionsCounts.colisIn,
          colisOut: usagersInteractionsCounts.colisOut,
          appel: usagersInteractionsCounts.appel,
          visite: usagersInteractionsCounts.visite,
        },
      };

      return row;
    });
  }
}
