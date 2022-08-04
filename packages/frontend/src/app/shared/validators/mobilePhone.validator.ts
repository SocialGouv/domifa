import { ChangeData } from "ngx-intl-tel-input";
import { phoneUtil } from "./../phone/phoneUtils.service";
import { AbstractControl, ValidationErrors } from "@angular/forms";

export const mobilePhoneValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value as ChangeData;
  if (!value) {
    return null;
  }
  if (!value.number || value.number === "") {
    return null;
  }
  try {
    const parsedValue = phoneUtil.parse(value.number, value.countryCode);
    const error = { isNotMobilePhone: true };

    if (phoneUtil.isValidNumber(parsedValue)) {
      return phoneUtil.getNumberType(parsedValue) === 1 ? null : error;
    }
    return error;
  } catch (e) {
    return { isNotMobilePhone: true };
  }
};

export const anyPhoneValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value as ChangeData;
  if (!value) {
    return null;
  }
  if (!value.number || value.number === "") {
    return null;
  }

  try {
    const parsedValue = phoneUtil.parse(value.number, value.countryCode);
    return phoneUtil.isValidNumber(parsedValue)
      ? null
      : { isNotValidPhone: true };
  } catch (e) {
    return { isNotValidPhone: true };
  }
};
