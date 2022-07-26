import { ChangeData } from "ngx-intl-tel-input";
import { phoneUtil } from "./../phone/phoneUtils.service";
import { AbstractControl, ValidationErrors } from "@angular/forms";

export const mobilePhoneValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value as ChangeData;

  try {
    const parsedValue = phoneUtil.parse(value.number, value.countryCode);

    if (phoneUtil.isValidNumber(parsedValue)) {
      return phoneUtil.getNumberType(parsedValue) === 1
        ? null
        : { isNotMobile: true };
    }
    return { isNotMobile: true };
  } catch (e) {
    return { isNotMobile: true };
  }
};
