import { FormGroup } from "@angular/forms";
import { parseDateFromNgb } from "./bootstrap-util";

export const regexp = {
  date: /^([0-9]|[0-2][0-9]|(3)[0-1])(\/)(([0-9]|(0)[0-9])|((1)[0-2]))(\/)\d{4}$/,
  email:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // tslint:disable max-line-length
  phone: /^((\+)33|0)[1-9](\d{2}){4}$/,
  mobilePhone: /^(06|07)(\d{2}){4}$/,
  postcode: /^[0-9][0-9AB][0-9]{3}$/,
};

export const password = {
  max: 128,
  min: 6,
};

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
