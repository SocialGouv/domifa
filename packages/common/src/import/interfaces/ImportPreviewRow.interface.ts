import { type ImportPreviewColumn } from "./ImportPreviewColumn.interface";

export interface ImportPreviewRow {
  rowNumber: number;
  isValid: boolean;
  errorsCount: number;
  columns: Record<string, ImportPreviewColumn>;
}
