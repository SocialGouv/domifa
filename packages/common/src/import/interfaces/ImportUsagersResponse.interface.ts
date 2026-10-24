import { type UsagersImportMode } from "../enums";
import { type ImportPreviewTable } from "./ImportPreviewTable.interface";

export interface ImportUsagersResponse {
  importMode: UsagersImportMode;
  previewTable: ImportPreviewTable;
}
