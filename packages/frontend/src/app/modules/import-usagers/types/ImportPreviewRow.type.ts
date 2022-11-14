import { ImportPreviewColumn } from "./ImportPreviewColumn.type";

export type ImportPreviewRow = {
  rowNumber: number;
  isValid: boolean;
  errorsCount: number;
  columns: { [attributeName: string]: ImportPreviewColumn };
};
