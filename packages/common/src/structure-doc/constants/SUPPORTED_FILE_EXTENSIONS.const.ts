import { UploadType } from "../types";

export const SUPPORTED_FILE_EXTENSIONS: { [key in UploadType]: string[] } = {
  STRUCTURE_CUSTOM_DOC: [".docx"],
  STRUCTURE_DOC: [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf",
    ".odt",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ots",
    ".ods",
  ],
  IMPORT: [".xls", ".xlsx", ".ots", ".ods"],
  USAGER_DOC: [".jpg", ".jpeg", ".png", ".pdf"],
};
