import { PhoneNumberUtil } from "google-libphonenumber";
import { ChangeData, CountryISO } from "ngx-intl-tel-input";
import { Telephone, COUNTRY_CODES } from "../../../_common/model";

export const phoneUtil = PhoneNumberUtil.getInstance();

export const getPhoneString = (telephone?: Telephone): string => {
  if (!telephone) {
    return "";
  }
  if (telephone.numero === null || telephone.numero === "") {
    return "";
  }
  return `+${COUNTRY_CODES[telephone.countryCode]}${telephone.numero}`;
};

export const getCountryCode = (countryCode: string): string => {
  if (COUNTRY_CODES[countryCode] === undefined) return "+33";

  return `+${COUNTRY_CODES[countryCode]}`;
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
    const parsedPhone = phoneUtil.parse(getPhoneString(telephone));
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
