/* eslint-disable no-useless-escape */
import { FormGroup } from "@angular/forms";
import { parseDateFromNgb } from "../bootstrap-util";

export const endDateAfterBeginDateValidator = ({
  beginDateControlName,
  endDateControlName,
}: {
  beginDateControlName: string;
  endDateControlName: string;
}) => {
  return (formGroup: FormGroup) => {
    const beginDateControl = formGroup.controls[beginDateControlName];
    const endDateControl = formGroup.controls[endDateControlName];

    if (beginDateControl.value && endDateControl.value) {
      const beginDate = parseDateFromNgb(beginDateControl.value);
      const endDate = parseDateFromNgb(endDateControl.value);
      if (beginDate.getTime() < endDate.getTime()) {
        endDateControl.setErrors(null);
        return;
      }
      endDateControl.setErrors({ endDateAfterBeginDate: true });
    }
    return;
  };
};
