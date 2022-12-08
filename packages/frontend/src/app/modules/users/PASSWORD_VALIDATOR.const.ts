import { Validators } from "@angular/forms";
import { PasswordValidator } from "./services";

export const PASSWORD_VALIDATOR = [
  Validators.required,
  PasswordValidator.patternValidator(/\d/, {
    hasNumber: true,
  }),
  PasswordValidator.patternValidator(/[A-Z]/, {
    hasCapitalCase: true,
  }),
  PasswordValidator.patternValidator(/[a-z]/, {
    hasLowerCase: true,
  }),
  Validators.minLength(12),
  Validators.maxLength(150),
];
