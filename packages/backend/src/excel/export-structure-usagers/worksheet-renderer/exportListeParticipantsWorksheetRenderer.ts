import { Column, Workbook } from "exceljs";
import {
  decisionLabels,
  motifsRadiation,
  motifsRefus,
} from "../../../stats/usagers.labels";
import {
  WorksheetRenderer,
  xlFormater,
  xlRenderer,
  XlRowModel,
} from "../../xlLib";
import { StructureUsagersExportModel } from "../StructureUsagersExportModel.type";
import { Decision } from "../../../usagers/interfaces/decision";

export const exportListeParticipantsWorksheetRenderer = {
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
      { key: "villeNaissance" },
      { key: "phone" },
      { key: "email" },
      { key: "decisionStatut" },
      { key: "decisionMotifRefus" },
      { key: "decisionUserRefus" },
      { key: "decisionMotifRadie" },
      { key: "decisionUserRadie" },
      { key: "decisionDate" },
      { key: "typeDom" },
      { key: "decisionDateDebut" },
      { key: "decisionDateFin" },
      { key: "datePremiereDom" },
      { key: "decisionUserPremierDom" },
      { key: "decisionUserRenouvellement" },
      { key: "dateLastInteraction" },
      { key: "ayantsDroitsCount" },
    ];

    const maxAyantDroitsCount = model.usagers.reduce((acc, u) => {
      if (acc < u.ayantsDroits.length) {
        return u.ayantsDroits.length;
      }
      return acc;
    }, 0);

    for (let i = 0; i < maxAyantDroitsCount; i++) {
      columns.push({
        key: `ayant_droit_nom_${i + 1}`,
        width: 20,
      });
      columns.push({
        key: `ayant_droit_prenom_${i + 1}`,
        width: 20,
      });
      columns.push({
        key: `ayant_droit_date_naissance_${i + 1}`,
        width: 20,
      });
      columns.push({
        key: `ayant_droit_lien_parente_${i + 1}`,
        width: 20,
      });
    }

    worksheetRendered.configureColumn(columns);

    worksheetRendered.renderCell(1, columns[1].key, {
      value: xlFormater.toLocalTimezone(model.exportDate),
    });

    const headerRow: XlRowModel = {
      values: {},
    };

    for (let i = 0; i < maxAyantDroitsCount; i++) {
      const prefix = `Ayant-droit ${i + 1}`;
      headerRow.values[`ayant_droit_nom_${i + 1}`] = `${prefix}\nNom`;
      headerRow.values[`ayant_droit_prenom_${i + 1}`] = `${prefix}\nPrénom`;
      headerRow.values[
        `ayant_droit_date_naissance_${i + 1}`
      ] = `${prefix}\nDate Naissance`;
      headerRow.values[
        `ayant_droit_lien_parente_${i + 1}`
      ] = `${prefix}\nLien parenté`;
    }
    worksheetRendered.renderRow(2, headerRow, { insert: false });
  }
}

function buildRows(model: StructureUsagersExportModel): XlRowModel[] {
  return model.usagers.map((usager) => {
    if (
      usager.decision.statut === "REFUS" ||
      usager.decision.statut === "RADIE"
    ) {
      if (usager.decision.motif === "AUTRE") {
        usager.decision.motif =
          usager.decision.motifDetails !== ""
            ? "Autre motif" + usager.decision.motifDetails
            : "Autre motif non précisé";
      } else {
        usager.decision.motif =
          usager.decision.statut === "REFUS"
            ? motifsRefus[usager.decision.motif]
            : motifsRadiation[usager.decision.motif];
      }
    } else {
      usager.decision.motif = "";
    }

    let userValidateFirstDom = usager.decision.userName;

    if (usager.typeDom !== "PREMIERE") {
      usager.historique.every((decision: Decision) => {
        if (
          decision.statut === "PREMIERE_DOM" ||
          decision.statut === "VALIDE"
        ) {
          userValidateFirstDom = decision.userName;
          return false;
        }
      });
    }

    const row: XlRowModel = {
      values: {
        customId: usager.customId,
        sexe: usager.sexe,
        nom: usager.nom,
        prenom: usager.prenom,
        surnom: usager.surnom,
        dateNaissance: usager.dateNaissance,
        villeNaissance: usager.villeNaissance,
        phone: usager.phone,
        email: usager.email,
        decisionStatut: decisionLabels[usager.decision.statut],
        decisionMotifRefus:
          usager.decision.statut === "REFUS" ? usager.decision.motif : "",

        decisionUserRefus:
          usager.decision.statut === "REFUS" ? usager.decision.userName : "",

        decisionMotifRadie:
          usager.decision.statut === "RADIE" ? usager.decision.motif : "",

        decisionUserRadie:
          usager.decision.statut === "RADIE" ? usager.decision.userName : "",

        decisionDate:
          usager.decision.statut === "RADIE"
            ? usager.decision.dateDecision
            : "",
        typeDom: usager.typeDom,
        decisionDateDebut:
          usager.decision.dateDebut && usager.decision.dateDebut !== null
            ? usager.decision.dateDebut
            : "",
        decisionDateFin:
          usager.decision.dateFin && usager.decision.dateFin !== null
            ? usager.decision.dateFin
            : "",
        datePremiereDom:
          usager.datePremiereDom && usager.datePremiereDom !== null
            ? usager.datePremiereDom
            : "",

        decisionUserPremierDom: usager.decision.userName,

        decisionUserRenouvellement:
          usager.typeDom === "RENOUVELLEMENT" ? usager.decision.userName : "",

        dateLastInteraction:
          usager.lastInteraction.dateInteraction &&
          usager.lastInteraction.dateInteraction !== null
            ? usager.lastInteraction.dateInteraction
            : "",
        ayantsDroitsCount: usager.ayantsDroits.length,
      },
    };
    usager.ayantsDroits.forEach((ayantDroit, i) => {
      row.values[`ayant_droit_nom_${i + 1}`] = ayantDroit.nom;
      row.values[`ayant_droit_prenom_${i + 1}`] = ayantDroit.prenom;
      row.values[`ayant_droit_date_naissance_${i + 1}`] =
        ayantDroit.dateNaissance;
      row.values[`ayant_droit_lien_parente_${i + 1}`] = ayantDroit.lien;
    });

    return row;
  });
}
