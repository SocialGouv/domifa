import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import { ChangeData, CountryISO } from "ngx-intl-tel-input";
import { Telephone } from "../../../_common/model";

export const phoneUtil = PhoneNumberUtil.getInstance();

export const getPhoneString = (telephone: Telephone): string => {
  if (!telephone) {
    return "";
  }
  if (telephone.numero === null || telephone.numero === "") {
    return "";
  }

  const numero = phoneUtil.parse(
    telephone.numero,
    telephone.countryCode.toLowerCase()
  );
  return phoneUtil.format(numero, PhoneNumberFormat.INTERNATIONAL);
};

export function getFormPhone(formValue: ChangeData): Telephone {
  if (!formValue) {
    return {
      numero: "",
      countryCode: CountryISO.France,
    };
  }
  return {
    numero: formValue?.nationalNumber
      ? formValue?.nationalNumber.replace(/\s/g, "")
      : "",
    countryCode: formValue?.countryCode
      ? (formValue?.countryCode.toLowerCase() as CountryISO)
      : CountryISO.France,
  };
}

export function setFormPhone(telephone: Telephone): ChangeData {
  const defaultReturn = {
    // eslint-disable-next-line id-denylist
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
      // eslint-disable-next-line id-denylist
      number: parsedPhone.getNationalNumber()?.toString(),
      countryCode: telephone.countryCode,
    };
  } catch (e) {
    return defaultReturn;
  }
}
