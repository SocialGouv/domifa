import { WorksheetRenderer } from "../../xlLib";
import { StructureStatsExportModel } from "../StructureStatsExportModel.type";

import { format } from "date-fns";

export const exportStructureStatsWorksheetSection3Renderer = {
  renderSection3Interactions,
};

function renderSection3Interactions(context: {
  currentRowNumber: number;
  worksheetRendered: WorksheetRenderer;
  model: StructureStatsExportModel;
}) {
  const { currentRowNumber, worksheetRendered, model } = context;
  let i = currentRowNumber;

  const data = model.stats.data.interactions;
  worksheetRendered.renderCell(i++, "b", {
    value: `3. TOTAL DES INTERACTIONS DU ${format(
      new Date(model.stats.period.startDateUTC),
      "dd/MM/yyyy"
    )} AU ${format(new Date(model.stats.period.endDateUTC), "dd/MM/yyyy")}`,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.appel,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.colisIn,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.colisOut,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.courrierIn,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.courrierOut,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.recommandeIn,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.recommandeOut,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.allVisites,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.visiteOut,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.visite,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.loginPortail,
  });
  context.currentRowNumber = i;
}
