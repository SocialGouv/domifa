import { Column, Workbook } from "exceljs";

import { WorksheetRenderer, xlFormater, xlRenderer } from "../../xlLib";
import { StatsDeploiementExportModel } from "../StatsDeploiementExportModel.type";
import { InteractionType, REGIONS_LISTE } from "@domifa/common";

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
  renderTotalActifs();
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
  function renderTotalActifs() {
    let i = 13;
    worksheetRendered.renderCell(i++, "b", {
      value: stats.usagersActifs.actifs,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.usagersActifs.domicilies,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.usagersActifs.ayantsDroits,
    });
  }

  function renderStructuresCountByType() {
    let i = 18;
    worksheetRendered.renderCell(i++, "b", {
      value: stats.structures.length,
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.structuresCountByType["asso"],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.structuresCountByType["ccas"],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.structuresCountByType["cias"],
    });
  }

  function renderInteractionsCountByType() {
    let i = 28;
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
      value:
        stats.interactionsCountByStatut["colisOutForwarded" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["courrierIn" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["courrierOut" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value:
        stats.interactionsCountByStatut[
          "courrierOutForwarded" as InteractionType
        ],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["recommandeIn" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value:
        stats.interactionsCountByStatut["recommandeOut" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value:
        stats.interactionsCountByStatut[
          "recommandeOutForwarded" as InteractionType
        ],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["allVisites" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["visite" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["visiteOut" as InteractionType],
    });
    worksheetRendered.renderCell(i++, "b", {
      value: stats.interactionsCountByStatut["loginPortail" as InteractionType],
    });
  }

  function renderExportDate() {
    worksheetRendered.renderCell(1, "b", {
      value: xlFormater.toLocalTimezone(stats.exportDate),
    });
  }

  function renderUsersDocsCount() {
    worksheetRendered.renderCell(24, "b", {
      value: stats.usersCount,
    });
    worksheetRendered.renderCell(25, "b", {
      value: stats.docsCount,
    });
  }

  function renderStructuresCountByRegion() {
    let i = 4;
    return stats.structuresCountByRegion.forEach((x) => {
      worksheetRendered.renderRow(i++, {
        values: {
          d: REGIONS_LISTE[x.region],
          e: x.count,
        },
      });
    });
  }
}
