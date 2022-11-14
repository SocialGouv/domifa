import { ImportPreviewRow } from "./ImportPreviewRow.type";

export type ImportPreviewTable = {
  isValid: boolean;
  rows: ImportPreviewRow[];
  totalCount: number;
  errorsCount: number;
};
