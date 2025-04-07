import { AbstractControl, ValidationErrors } from "@angular/forms";
import isEmail from "validator/lib/isEmail";

export const EmailValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  if (!control?.value) {
    return null;
  }
  return !isEmail(control?.value) ? { invalidEmail: true } : null;
};
