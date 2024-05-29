import { AbstractControl, ValidatorFn } from "@angular/forms";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function valueInArrayValidator(tab: any[]): ValidatorFn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (control: AbstractControl): { [key: string]: any } | null => {
    const isValid = tab.includes(control.value);
    return isValid ? null : { valueNotInArray: { value: control.value } };
  };
}
