import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { UsagerDoc } from "@domifa/common";

export type UploadResponseType = {
  success?: boolean;
  status?: string;
  message?: number;
  filePath?: string;
  body?: UsagerDoc[];
};

export const mimeTypes = {
  STRUCTURE_CUSTOM_DOC: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  STRUCTURE_DOC: [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ],
  IMPORT: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.spreadsheet",
  ],
  USAGER_DOC: ["image/jpg", "image/jpeg", "image/png", "application/pdf"],
};

export function validateUpload(
  uploadType:
    | "STRUCTURE_DOC"
    | "STRUCTURE_CUSTOM_DOC"
    | "USAGER_DOC"
    | "IMPORT",
  required = false
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (file) {
      const validFileExtensions = mimeTypes[uploadType];

      const hasGoodSize = file.size < 10000000;
      const hasGoodExtension = validFileExtensions.includes(file.type);

      if (!hasGoodSize || !hasGoodExtension) {
        const errors: {
          fileSize?: boolean;
          fileType?: boolean;
        } = {};

        if (!hasGoodSize) {
          errors.fileSize = true;
        }
        if (!hasGoodExtension) {
          errors.fileType = true;
        }
        return errors;
      }
      return null;
    }

    return required ? { required: true } : null;
  };
}
