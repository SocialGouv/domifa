import { Column, Workbook } from "exceljs";

import {
  WorksheetRenderer,
  xlFormater,
  xlRenderer,
  XlRowModel,
} from "../../xlLib";
import { StructureUsagersExportModel } from "../StructureUsagersExportModel.type";
import {
  USAGER_DECISION_STATUT_LABELS,
  UsagerDecision,
  generateMotifLabel,
  COUNTRY_CODES,
} from "@domifa/common";

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
      { key: "countryCode" },
      { key: "phone" },
      { key: "email" },
      { key: "langue" },
      { key: "numeroDistribution" },
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
    let decisionDateDebut: string | Date =
      (usager.decision.statut === "INSTRUCTION" ||
        usager.decision.statut === "ATTENTE_DECISION") &&
      usager.decision.typeDom === "PREMIERE_DOM"
        ? ""
        : asDate(usager.decision.dateDebut);
    let decisionDateFin = asDate(usager.decision.dateFin);

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

    if (
      usager.decision.statut === "RADIE" ||
      (usager.decision.statut === "REFUS" &&
        usager.typeDom === "RENOUVELLEMENT")
    ) {
      const decisionValidePlusRecente: UsagerDecision = usager.historique
        .filter((decision) => decision.statut === "VALIDE")
        .sort(
          (a, b) =>
            new Date(b.dateDecision).getTime() -
            new Date(a.dateDecision).getTime()
        )[0];

      if (decisionValidePlusRecente) {
        decisionDateDebut = asDate(decisionValidePlusRecente.dateDebut);
        decisionDateFin = asDate(usager.decision.dateDebut);
      }
    }

    const countryCode = usager.telephone?.countryCode
      ? "+" + COUNTRY_CODES[usager.telephone.countryCode.toLowerCase()]
      : "";
    const row: XlRowModel = {
      values: {
        customRef: usager.customRef,
        sexe: usager.sexe,
        nom: usager.nom,
        prenom: usager.prenom,
        surnom: usager.surnom,
        dateNaissance: usager.dateNaissance,
        villeNaissance: usager.villeNaissance,
        countryCode,
        phone: usager.telephone.numero,
        email: usager.email,
        numeroDistribution: usager.numeroDistribution,
        decisionStatut: USAGER_DECISION_STATUT_LABELS[usager.decision.statut],
        decisionMotifRefus:
          usager.decision.statut === "REFUS" ? usager.decision.motif : "",
        decisionUserRefus:
          usager.decision.statut === "REFUS" ? usager.decision.userName : "",
        decisionMotifRadie:
          usager.decision.statut === "RADIE" ? usager.decision.motif : "",
        decisionUserRadie:
          usager.decision.statut === "RADIE" ? usager.decision.userName : "",
        typeDom: usager.typeDom,
        decisionDateDebut,
        decisionDateFin,
        datePremiereDom: asDate(usager.datePremiereDom),
        decisionDate: asDate(usager.decision.dateDecision),
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
