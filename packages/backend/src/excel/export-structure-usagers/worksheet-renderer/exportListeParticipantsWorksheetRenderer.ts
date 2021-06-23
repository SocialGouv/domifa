import { Column, Workbook } from "exceljs";
import {
  WorksheetRenderer,
  xlFormater,
  xlRenderer,
  XlRowModel,
} from "../../xlLib";
import { StructureUsagersExportModel } from "../StructureUsagersExportModel.type";
import { generateMotifLabel } from "./../../../usagers/services/generateMotifLabel.service";
import { USAGER_DECISION_STATUT_LABELS } from "./../../../_common/labels/USAGER_DECISION_STATUT_LABELS.const";

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
      { key: "customRef" },
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
    usager.decision.motif = generateMotifLabel(usager.decision) as any;

    let decisionUserPremierDom = "";
    let decisionUserRenouvellement = "";

    usager.historique.sort((a, b) => {
      const dateDecisionA = new Date(a.dateDecision);
      const dateDecisionB = new Date(b.dateDecision);
      return dateDecisionA.getTime() - dateDecisionB.getTime();
    });

    for (const decision of usager.historique) {
      if (decision.statut === "VALIDE") {
        decisionUserPremierDom === ""
          ? (decisionUserPremierDom = decision.userName)
          : (decisionUserRenouvellement = decision.userName);
      }
    }

    if (usager.decision.statut === "VALIDE") {
      if (usager.typeDom === "RENOUVELLEMENT") {
        decisionUserRenouvellement = usager.decision.userName;
      } else {
        decisionUserPremierDom = usager.decision.userName;
      }
    }

    const row: XlRowModel = {
      values: {
        customRef: usager.customRef,
        sexe: usager.sexe,
        nom: usager.nom,
        prenom: usager.prenom,
        surnom: usager.surnom,
        dateNaissance: usager.dateNaissance,
        villeNaissance: usager.villeNaissance,
        phone: usager.phone,
        email: usager.email,
        decisionStatut: USAGER_DECISION_STATUT_LABELS[usager.decision.statut],
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
            ? asDate(usager.decision.dateDecision)
            : "",
        typeDom: usager.typeDom,
        decisionDateDebut: asDate(usager.decision.dateDebut),
        decisionDateFin: asDate(usager.decision.dateFin),
        datePremiereDom: asDate(usager.datePremiereDom),

        decisionUserPremierDom,

        decisionUserRenouvellement,

        dateLastInteraction: asDate(usager.lastInteraction.dateInteraction),
        ayantsDroitsCount: usager.ayantsDroits.length,
      },
    };
    usager.ayantsDroits.forEach((ayantDroit, i) => {
      row.values[`ayant_droit_nom_${i + 1}`] = ayantDroit.nom;
      row.values[`ayant_droit_prenom_${i + 1}`] = ayantDroit.prenom;
      row.values[`ayant_droit_date_naissance_${i + 1}`] = asDate(
        ayantDroit.dateNaissance
      );
      row.values[`ayant_droit_lien_parente_${i + 1}`] = ayantDroit.lien;
    });

    return row;
  });
}

function asDate(date: string | Date): Date {
  return date ? new Date(date) : undefined;
}
