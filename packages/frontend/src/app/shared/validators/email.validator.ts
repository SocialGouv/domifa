import { AbstractControl, ValidationErrors } from "@angular/forms";
import { isValidEmail } from "@domifa/common";

export const EmailValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  if (!control?.value) {
    return null;
  }
  return !isValidEmail(control?.value) ? { invalidEmail: true } : null;
};
