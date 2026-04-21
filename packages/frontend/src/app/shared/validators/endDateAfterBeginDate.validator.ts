import { AbstractControl, ValidationErrors } from "@angular/forms";
import { differenceInCalendarDays, isValid } from "date-fns";
import { parseFrDate } from "../date-utils";

export const endDateAfterBeginDateValidator = (
  controls: AbstractControl
): ValidationErrors | null => {
  const beginDateControl: AbstractControl | null = controls.get("dateDebut");
  const endDateControl: AbstractControl | null = controls.get("dateFin");

  return beginDateControl && endDateControl
    ? endDateAfterBeginDateCheck(beginDateControl, endDateControl)
    : null;
};

export const endDateAfterBeginDateCheck = (
  beginDateControl: AbstractControl,
  endDateControl: AbstractControl
): ValidationErrors | null => {
  if (beginDateControl.value && endDateControl.value) {
    const beginDate = isValid(beginDateControl.value)
      ? beginDateControl.value
      : parseFrDate(beginDateControl.value);
    const endDate = isValid(endDateControl.value)
      ? endDateControl.value
      : parseFrDate(endDateControl.value);

    if (!beginDate || !endDate) {
      return null;
    }

    if (differenceInCalendarDays(endDate, beginDate) >= 0) {
      return null;
    }

    endDateControl.setErrors({ endDateAfterBeginDate: true });
    return { endDateAfterBeginDate: true };
  }
  return null;
};
