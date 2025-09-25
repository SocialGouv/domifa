import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class PasswordValidator {
  public static patternValidator(
    regex: RegExp,
    error: ValidationErrors
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

  public onClick(event: Event) {
    console.log(event);
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
}
