import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faFileWord,
  faImage,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-regular-svg-icons";

export const STRUCTURE_DOC_ICONS: {
  [key: string]: IconDefinition;
} = {
  "image/jpg": faImage,
  "image/jpeg": faImage,
  "image/png": faImage,
  "application/pdf": faFilePdf,
  "application/msword": faFileWord,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    faFileWord,
  "application/vnd.oasis.opendocument.text": faFileWord,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    faFileExcel,
  "application/vnd.ms-excel": faFileExcel,
};
