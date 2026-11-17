import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { isValidEmail } from "@domifa/common";
import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

// Same email rule as the frontend structures and the backend (@domifa/common)
export const EmailValidator = (
  control: AbstractControl
): ValidationErrors | null =>
  !control?.value || isValidEmail(control.value)
    ? null
    : { invalidEmail: true };

// Rejects strings made only of spaces
export const NotBlankValidator = (
  control: AbstractControl
): ValidationErrors | null =>
  typeof control.value === "string" && control.value.trim() === ""
    ? { required: true }
    : null;

// Optional text: empty is fine, otherwise at least `min` characters
export const optionalMinLengthValidator =
  (min: number): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === "string" ? control.value.trim() : "";
    return value.length > 0 && value.length < min
      ? { minlength: { requiredLength: min, actualLength: value.length } }
      : null;
  };

// Phone number valid for the given country, with the same library as the
// backend @IsValidPhone validator. Empty is fine (use Validators.required).
export const phoneValidator =
  (countryCode: string): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const numero = typeof control.value === "string" ? control.value : "";
    if (numero.trim() === "") {
      return null;
    }
    try {
      const parsed = phoneUtil.parse(numero, countryCode);
      return phoneUtil.isValidNumber(parsed) ? null : { invalidPhone: true };
    } catch {
      return { invalidPhone: true };
    }
  };
