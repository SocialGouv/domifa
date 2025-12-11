import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class PasswordValidator {
  public static patternValidator(
    regex: RegExp,
    error: ValidationErrors,
  ): ValidatorFn {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);
      return valid ? null : error;
    };
  }

  public static fieldsNotEqualsValidator({
    ctrl1Name,
    ctrl2Name,
    errName,
  }: {
    ctrl1Name: string;
    ctrl2Name: string;
    errName: string;
  }) {
    const validatorFn: ValidatorFn = (control: AbstractControl) => {
      const ctrl1 = control.get(ctrl1Name);
      const ctrl2 = control.get(ctrl2Name);

      if (ctrl1?.enabled && ctrl2?.enabled && ctrl1?.value === ctrl2?.value) {
        const err: ValidationErrors = {};
        err[errName] = true;
        return err;
      }
      return null;
    };
    return validatorFn;
  }
  public static fieldsEqualsValidator({
    ctrl1Name,
    ctrl2Name,
    errName,
  }: {
    ctrl1Name: string;
    ctrl2Name: string;
    errName: string;
  }) {
    const validatorFn: ValidatorFn = (control: AbstractControl) => {
      const ctrl1 = control.get(ctrl1Name);
      const ctrl2 = control.get(ctrl2Name);

      if (ctrl1?.enabled && ctrl2?.enabled && ctrl1?.value !== ctrl2?.value) {
        const err: ValidationErrors = {};
        err[errName] = true;
        return err;
      }
      return null;
    };
    return validatorFn;
  }

  public static passwordMatchValidator(
    passwordControlName: string,
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const passwordControl = control.parent.get(passwordControlName);

      if (!passwordControl) {
        return null;
      }

      if (passwordControl.value !== control.value) {
        return { passwordMismatch: true };
      }

      return null;
    };
  }
}
