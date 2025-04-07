import { AbstractControl, ValidationErrors } from "@angular/forms";

export const NoWhiteSpaceValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  if (!control?.value) {
    return { whitespace: true };
  }

  const isWhitespace = control?.value.toString().trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { whitespace: true };
};
