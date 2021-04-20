import { ImportPreviewRow } from "./ImportPreviewRow.type";

export type ImportPreviewTable = {
  rows: ImportPreviewRow[];
  isValid: boolean;
  errorsCount: number;
};
