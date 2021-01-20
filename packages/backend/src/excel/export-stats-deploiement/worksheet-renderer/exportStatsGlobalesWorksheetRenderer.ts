import { Column, Workbook } from "exceljs";
import { InteractionType } from "../../../_common/model/interaction/InteractionType.type";
import { REGIONS_LABELS_MAP } from "../../../structures/REGIONS_LABELS_MAP.const";
import { StructureType } from "../../../_common/model/structure/StructureType.type";
import { WorksheetRenderer, xlFormater, xlRenderer } from "../../xlLib";
import { StatsDeploiementExportModel } from "../StatsDeploiementExportModel.type";

export const exportStatsGlobalesWorksheetRenderer = {
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
      value: stats.usagersCountByStatut.TOUS,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.usagersCountByStatut.VALIDE,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.usagersCountByStatut.INSTRUCTION,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.usagersCountByStatut.ATTENTE_DECISION,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.usagersCountByStatut.REFUS,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.usagersCountByStatut.RADIE,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.usagersCountByStatut.AYANTS_DROITS,
    });
  }

  function renderStructuresCountByType() {
    let i = 13;
    worksheetRendered.renderCell(i++, "b", {
      value: stats.structures.length,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.structuresCountByType["asso" as StructureType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.structuresCountByType["ccas" as StructureType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.structuresCountByType["cias" as StructureType],
    });
  }
  function renderInteractionsCountByType() {
    let i = 22;
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["appel" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["colisIn" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["colisOut" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["courrierIn" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["courrierOut" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["npai" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["recommandeIn" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value:
        stats.interactionsCountByStatut["recommandeOut" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["visite" as InteractionType],
    });
  }

  function renderExportDate() {
    worksheetRendered.renderCell(1, "b", {
      value: xlFormater.toLocalTimezone(stats.exportDate),
    });
  }

  function renderUsersDocsCount() {
    worksheetRendered.renderCell(18, "b", {
      value: stats.usersCount,
    });
    worksheetRendered.renderCell(19, "b", {
      value: stats.docsCount,
    });
  }

  function renderStructuresCountByRegion() {
    let i = 4;
    return stats.structuresCountByRegion.forEach((x) => {
      worksheetRendered.renderRow(i++, {
        values: {
          d: REGIONS_LABELS_MAP[x.region],
          e: x.count,
        },
      });
    });
  }
}
