import { WorksheetRenderer } from "../../xlLib";
import { StructureStatsExportModel } from "../StructureStatsExportModel.type";
import moment = require("moment");

export const exportStructureStatsWorksheetSection2Renderer = {
  renderSection2ActiviteDecisions,
};

function renderSection2ActiviteDecisions(context: {
  currentRowNumber: number;
  worksheetRendered: WorksheetRenderer;
  model: StructureStatsExportModel;
}) {
  const { currentRowNumber, worksheetRendered, model } = context;
  let i = currentRowNumber;

  const data = model.stats.data.decisions;
  worksheetRendered.renderCell(i++, "b", {
    value: `2. ACTIVITÉ DU ${moment
      .utc(model.stats.period.startDateUTC)
      .format("DD/MM/yyyy")} AU ${moment
      .utc(model.stats.period.endDateUTC)
      .format("DD/MM/yyyy")}`,
  });
  i++; // blank line
  worksheetRendered.renderCell(i++, "c", {
    value: data.valid.usagers.total,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.valid.usagers.premiere_demande,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.valid.usagers.renouvellement,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.valid.ayantsDroits.total,
  });
  i++; // blank line
  worksheetRendered.renderCell(i++, "c", {
    value: data.radie.total,
  });
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.radie.motif.a_sa_demande,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.radie.motif.plus_de_lien_commune,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.radie.motif.fin_de_domiciliation,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.radie.motif.non_manifestation_3_mois,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.radie.motif.non_respect_reglement,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.radie.motif.entree_logement,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.radie.motif.autre,
  });
  i++; // blank line
  worksheetRendered.renderCell(i++, "c", {
    value: data.refus.total,
  });
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.refus.motif.hors_agrement,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.refus.motif.lien_commune,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.refus.motif.saturation,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.refus.motif.autre,
  });
  i++; // title
  worksheetRendered.renderCell(i++, "c", {
    value: data.refus.reorientation.ccas,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: data.refus.reorientation.asso,
  });
  i++; // blank line

  context.currentRowNumber = i;
}
