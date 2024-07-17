import { StructureCommon } from "@domifa/common";

import * as XLSX from "xlsx";
import { renderStructureUsagersRows } from "./renderStructureUsagersRows";
import { StructureUsagerExport } from "./StructureUsagerExport.type";
import { StructureCustomDocTags } from "../../../_common/model";
import { isValid, parse } from "date-fns";

export const renderStructureUsagersExcel = (
  usagers: StructureUsagerExport[],
  structure: StructureCommon
): Buffer => {
  const { firstSheetUsagers, secondSheetEntretiens } =
    renderStructureUsagersRows(usagers, structure);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();

  applyDateFormat(firstSheetUsagers, [
    "USAGER_DATE_NAISSANCE",
    "DATE_RADIATION",
    "DATE_REFUS",
    "DATE_DEBUT_DOM",
    "DATE_FIN_DOM",
    "DATE_PREMIERE_DOM",
    "DATE_DERNIER_PASSAGE",
  ]);

  // Appliquer le format de date aux colonnes de dates dans wsEntretiens
  applyDateFormat(secondSheetEntretiens, ["USAGER_DATE_NAISSANCE"]);

  const wsUsagers: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
    firstSheetUsagers,
    {
      skipHeader: true,
      cellDates: true,
      dateNF: "DD/MM/YYYY",
    }
  );

  const wsEntretiens: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
    secondSheetEntretiens,
    {
      skipHeader: true,
    }
  );

  XLSX.utils.book_append_sheet(wb, wsUsagers, "Liste des domiciliés");
  XLSX.utils.book_append_sheet(wb, wsEntretiens, "Entretiens");

  return XLSX.writeXLSX(wb, {
    bookType: "xlsx",
    compression: true,
    type: "buffer",
  });
};

const applyDateFormat = (
  worksheet: StructureCustomDocTags[],
  elements: Array<keyof StructureCustomDocTags>
): void => {
  worksheet.forEach((ws: StructureCustomDocTags) => {
    elements.forEach((element: keyof StructureCustomDocTags) => {
      if (ws[element]) {
        const value = ws[element] as string;
        ws[element] = isValid(parse(value, "dd/MM/yyyy", new Date()))
          ? parse(value, "dd/MM/yyyy", new Date())
          : value;
      }
    });
  });
};
