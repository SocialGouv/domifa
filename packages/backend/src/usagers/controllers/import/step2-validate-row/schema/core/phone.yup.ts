import { PhoneNumberFormat } from "google-libphonenumber";

import * as yup from "yup";

import {
  getPhoneString,
  isValidMobilePhone,
} from "../../../../../../util/phone/phoneUtils.service";

export function phone() {
  return yup
    .object({
      countryCode: yup.string(),
      numero: yup.string(),
    })
    .optional()
    .transform((value, originalValue) => {
      if (!originalValue && value) {
        originalValue = value;
      }
      if (isValidMobilePhone(originalValue)) {
        return {
          numero: getPhoneString(originalValue, PhoneNumberFormat.NATIONAL),
          countryCode: originalValue.countryCode,
        };
      }
      return originalValue;
    })
    .test("mobile-phone", "cannot be an existing value", (value) => {
      return isValidMobilePhone(value);
    });
}
