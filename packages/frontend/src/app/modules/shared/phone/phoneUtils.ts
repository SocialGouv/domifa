/* eslint-disable id-denylist */
import { PhoneNumberUtil } from "google-libphonenumber";
import { ChangeData, CountryISO } from "ngx-intl-tel-input-gg";
import { Telephone } from "../../../../_common/model";

export function getFormPhone(formValue: ChangeData): Telephone {
  if (!formValue) {
    return {
      numero: "",
      countryCode: CountryISO.France,
    };
  }
  return {
    numero: formValue?.nationalNumber
      ? formValue?.nationalNumber.replace(/\D/g, "")
      : "",
    countryCode: formValue?.countryCode
      ? (formValue?.countryCode.toLowerCase() as CountryISO)
      : CountryISO.France,
  };
}

export function setFormPhone(telephone: Telephone): ChangeData {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const defaultReturn = {
    number: "",
    countryCode: telephone.countryCode,
  };
  try {
    const parsedPhone = phoneUtil.parse(
      telephone.numero,
      telephone.countryCode
    );
    if (!phoneUtil.isValidNumber(parsedPhone) || !parsedPhone) {
      return defaultReturn;
    }
    return {
      number: parsedPhone.getNationalNumber()?.toString(),
      countryCode: telephone.countryCode,
    };
  } catch (e) {
    return defaultReturn;
  }
}
