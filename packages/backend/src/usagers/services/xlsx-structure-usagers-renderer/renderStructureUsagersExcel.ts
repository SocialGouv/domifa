import { StructureCommon } from "@domifa/common";

import * as XLSX from "xlsx";
import { renderStructureUsagersRows } from "./renderStructureUsagersRows";
import { StructureUsagerExport } from "./StructureUsagerExport.type";

export const renderStructureUsagersExcel = (
  usagers: StructureUsagerExport[],
  structure: StructureCommon
): Buffer => {
  const { firstSheetUsagers, secondSheetEntretiens } =
    renderStructureUsagersRows(usagers, structure);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();

  const wsUsagers: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
    firstSheetUsagers,
    {
      skipHeader: true,
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
