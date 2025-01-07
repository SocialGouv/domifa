import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { SUPPORTED_MIME_TYPES, UploadType, UsagerDoc } from "@domifa/common";

export type UploadResponseType = {
  success?: boolean;
  status?: string;
  message?: number;
  filePath?: string;
  body?: UsagerDoc[];
};

export function validateUpload(
  uploadType: UploadType,
  required = false
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (file) {
      const validFileExtensions = SUPPORTED_MIME_TYPES[uploadType];

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
