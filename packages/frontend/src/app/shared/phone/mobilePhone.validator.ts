import { AbstractControl, ValidationErrors } from "@angular/forms";
import { PhoneNumberUtil } from "google-libphonenumber";
import { Telephone } from "../../../_common/model";

export const mobilePhoneValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const value = control.value as Telephone;
  if (!value) {
    return null;
  }
  if (!value.numero || value.numero === "") {
    return null;
  }
  try {
    const parsedValue = phoneUtil.parse(value.numero, value.countryCode);
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
  const phoneUtil = PhoneNumberUtil.getInstance();
  const value = control.value as Telephone;
  if (!value) {
    return null;
  }
  if (!value.numero || value.numero === "") {
    return null;
  }

  try {
    const parsedValue = phoneUtil.parse(value.numero, value.countryCode);
    return phoneUtil.isValidNumber(parsedValue)
      ? null
      : { isNotValidPhone: true };
  } catch (e) {
    return { isNotValidPhone: true };
  }
};
