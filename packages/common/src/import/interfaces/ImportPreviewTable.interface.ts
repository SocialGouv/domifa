import { type ImportPreviewRow } from "./ImportPreviewRow.interface";

export interface ImportPreviewTable {
  isValid: boolean;
  rows: ImportPreviewRow[];
  totalCount: number;
  errorsCount: number;
}
