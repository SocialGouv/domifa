import { Column, Workbook } from "exceljs";
import { StructureType } from "../../../structures/StructureType.type";
import { REGIONS_LABELS_MAP } from "../../../structures/REGIONS_LABELS_MAP.const";
import { WorksheetRenderer, xlRenderer } from "../../xlLib";
import { StatsDeploiementExportModel } from "../StatsDeploiementExportModel.type";
import { InteractionType } from "../../../interactions/InteractionType.type";

export const exportStatsGlobalesWorksheetRenderer = {
  renderWorksheet,
};

function renderWorksheet({
  workbook,
  worksheetIndex,
  model,
}: {
  workbook: Workbook;
  worksheetIndex: number;
    model: StatsDeploiementExportModel;
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

  renderExportDate();
  renderUsagersCountByStatus();
  renderStructuresCountByRegion();
  renderStructuresCountByType();
  renderUsersDocsCount();
  renderInteractionsCountByType();

  function renderUsagersCountByStatus() {
    let i = 4;
    worksheetRendered.renderCell(i++, "b", {
      value: model.usagersCountByStatut.TOUS,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.usagersCountByStatut.VALIDE,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.usagersCountByStatut.INSTRUCTION,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.usagersCountByStatut.ATTENTE_DECISION,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.usagersCountByStatut.REFUS,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.usagersCountByStatut.RADIE,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.usagersCountByStatut.AYANTS_DROITS,
    });
  }

  function renderStructuresCountByType() {
    let i = 13;
    worksheetRendered.renderCell(i++, "b", {
      value: model.structures.length,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.structuresCountByType["asso" as StructureType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.structuresCountByType["ccas" as StructureType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.structuresCountByType["cias" as StructureType],
    });
  }
  function renderInteractionsCountByType() {
    let i = 22;
    worksheetRendered.renderCell(i++, "b", {
      value: model.interactionsCountByStatut["appel" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.interactionsCountByStatut["colisIn" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.interactionsCountByStatut["colisOut" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.interactionsCountByStatut["courrierIn" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.interactionsCountByStatut["courrierOut" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.interactionsCountByStatut["npai" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.interactionsCountByStatut["recommandeIn" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value:
        model.interactionsCountByStatut["recommandeOut" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: model.interactionsCountByStatut["visite" as InteractionType],
    });
  }

  function renderExportDate() {
    worksheetRendered.renderCell(1, "b", {
      value: model.exportDate,
    });
  }

  function renderUsersDocsCount() {
    worksheetRendered.renderCell(18, "b", {
      value: model.usersCount,
    });
    worksheetRendered.renderCell(19, "b", {
      value: model.docsCount,
    });
  }

  function renderStructuresCountByRegion() {
    let i = 4;
    return model.structuresCountByRegion.forEach((x) => {
      worksheetRendered.renderRow(i++, {
        values: {
          d: REGIONS_LABELS_MAP[x.region],
          e: x.count,
        },
      });
    });
  }
}
