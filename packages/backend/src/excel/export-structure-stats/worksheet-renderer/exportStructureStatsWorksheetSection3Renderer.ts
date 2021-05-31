import { WorksheetRenderer } from "../../xlLib";
import { StructureStatsExportModel } from "../StructureStatsExportModel.type";
import moment = require("moment");

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
    value: `3. TOTAL DES INTERACTIONS DU ${moment
      .utc(model.stats.period.startDateUTC)
      .format("DD/MM/yyyy")} AU ${moment
      .utc(model.stats.period.endDateUTC)
      .format("DD/MM/yyyy")}`,
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
    value: data.visite,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.npai,
  });

  context.currentRowNumber = i;
}
