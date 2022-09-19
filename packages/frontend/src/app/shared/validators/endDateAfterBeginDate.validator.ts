import { AbstractControl, ValidationErrors } from "@angular/forms";
import { differenceInCalendarDays, isValid } from "date-fns";
import { parseDateFromNgb } from "../bootstrap-util";

export const endDateAfterBeginDateValidator = (
  controls: AbstractControl
): ValidationErrors | null => {
  const beginDateControl: AbstractControl = controls.get("dateDebut");
  const endDateControl: AbstractControl = controls.get("dateFin");
  return endDateAfterBeginDateCheck(beginDateControl, endDateControl);
};

export const endDateAfterBeginDateCheck = (
  beginDateControl: AbstractControl,
  endDateControl: AbstractControl
): ValidationErrors | null => {
  if (beginDateControl.value && endDateControl.value) {
    const beginDate = isValid(beginDateControl.value)
      ? beginDateControl.value
      : parseDateFromNgb(beginDateControl.value);
    const endDate = isValid(endDateControl.value)
      ? endDateControl.value
      : parseDateFromNgb(endDateControl.value);

    if (differenceInCalendarDays(endDate, beginDate) >= 0) {
      return null;
    }

    endDateControl.setErrors({ endDateAfterBeginDate: true });
    return { endDateAfterBeginDate: true };
  }
  return null;
};
