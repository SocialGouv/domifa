/* eslint-disable no-useless-escape */
import { FormGroup, ValidatorFn } from "@angular/forms";
import { differenceInCalendarDays, isValid } from "date-fns";
import { parseDateFromNgb } from "../bootstrap-util";

export const endDateAfterBeginDateValidator = ({
  beginDateControlName,
  endDateControlName,
}: {
  beginDateControlName: string;
  endDateControlName: string;
}): ValidatorFn | null => {
  return (formGroup: FormGroup) => {
    const beginDateControl = formGroup.controls[beginDateControlName];
    const endDateControl = formGroup.controls[endDateControlName];

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

      return { endDateAfterBeginDate: true };
    }
    return null;
  };
};
