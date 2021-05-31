import { Column, Workbook } from "exceljs";
import { WorksheetRenderer, xlFormater, xlRenderer } from "../../xlLib";
import { StructureStatsExportModel } from "../StructureStatsExportModel.type";
import { exportStructureStatsWorksheetSection1Renderer } from "./exportStructureStatsWorksheetSection1Renderer";
import { exportStructureStatsWorksheetSection2Renderer } from "./exportStructureStatsWorksheetSection2Renderer";
import { exportStructureStatsWorksheetSection3Renderer } from "./exportStructureStatsWorksheetSection3Renderer";
import moment = require("moment");

export const exportStructureStatsWorksheetRenderer = {
  renderWorksheet,
};

function renderWorksheet({
  workbook,
  worksheetIndex,
  model,
}: {
  workbook: Workbook;
  worksheetIndex: number;
  model: StructureStatsExportModel;
}) {
  const worksheetRendered: WorksheetRenderer = xlRenderer.selectWorksheet(
    workbook.worksheets[worksheetIndex]
  );

  const columns: Partial<Column>[] = [
    { key: "a" },
    { key: "b" },
    { key: "c" },
    { key: "d" },
    { key: "e" },
  ];

  worksheetRendered.configureColumn(columns);

  const context = {
    currentRowNumber: 1,
    worksheetRendered,
    model,
  };
  renderExportHeader(context);

  exportStructureStatsWorksheetSection1Renderer.renderSection1ValidUsagers(
    context
  );
  exportStructureStatsWorksheetSection2Renderer.renderSection2ActiviteDecisions(
    context
  );
  exportStructureStatsWorksheetSection3Renderer.renderSection3Interactions(
    context
  );
}

function renderExportHeader(context: {
  currentRowNumber: number;
  worksheetRendered: WorksheetRenderer;
  model: StructureStatsExportModel;
}) {
  const { currentRowNumber, worksheetRendered, model } = context;
  let i = currentRowNumber;

  worksheetRendered.renderCell(i++, "c", {
    value: model.stats.structure.nom,
  });
  worksheetRendered.renderCell(i++, "c", {
    value: xlFormater.toLocalTimezone(model.stats.structure.registrationDate),
  });
  worksheetRendered.renderCell(i++, "c", {
    value: xlFormater.toLocalTimezone(model.stats.structure.importDate),
  });
  i++; // blank line
  worksheetRendered.renderCell(i++, "c", {
    value: xlFormater.toLocalTimezone(model.exportDate),
  });
  worksheetRendered.renderCell(i++, "c", {
    value: xlFormater.toLocalTimezone(model.stats.period.startDateUTC),
  });
  worksheetRendered.renderCell(i++, "c", {
    value: xlFormater.toLocalTimezone(model.stats.period.endDateUTC),
  });
  i++; // blank line
  context.currentRowNumber = i;
}
